"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { useContrato } from "@/hooks/useContrato";
import { useContratoMutations } from "@/hooks/useContratoMutations";
import { useSimulacoesDoProcesso } from "@/hooks/useSimulacoes";
import { SimulacaoResponse } from "@/services/domains/simulacao";
import { ContratoResponse, StatusTitulo, TituloResponse } from "@/services/domains/contrato";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function moeda(valor: number | null | undefined): string {
  return valor == null ? "–" : BRL.format(valor);
}

function dataBR(iso: string | null | undefined): string {
  if (!iso) return "–";
  const [ano, mes, dia] = iso.split("-");
  if (!ano || !mes || !dia) return "–";
  return `${dia}/${mes}/${ano}`;
}

/** Competência é sempre dia 1, então o dia só polui: mostra mês/ano. */
function competenciaBR(iso: string | null | undefined): string {
  if (!iso) return "–";
  const [ano, mes] = iso.split("-");
  if (!ano || !mes) return "–";
  return `${mes}/${ano}`;
}

const CORES_STATUS: Record<StatusTitulo, "default" | "success" | "warning" | "error"> = {
  ABERTO: "default",
  PAGO: "success",
  CANCELADO: "default",
  ESTORNADO: "error",
  RENEGOCIADO: "warning",
};

interface Props {
  processoMatriculaId: number;
  anoLetivo: number;
}

/**
 * Onde a proposta deixa de ser simulação e passa a ser cobrança.
 *
 * Fica logo abaixo do bloco de bolsa de propósito: é a sequência real do balcão
 * — gera a proposta, concede a bolsa, a família aceita, efetiva. Antes desta tela
 * a cadeia da bolsa terminava no ar: o funcionário via o teto, reservava
 * orçamento, e não havia como transformar isso em contrato sem Postman.
 */
export default function BlocoEfetivacao({ processoMatriculaId, anoLetivo }: Props) {
  const { simulacoes, loading: carregandoSimulacoes } =
    useSimulacoesDoProcesso(processoMatriculaId);
  const { efetivar } = useContratoMutations(processoMatriculaId);
  const [confirmando, setConfirmando] = useState(false);

  /** Proposta já convertida: a matrícula deste lead está feita. */
  const convertida = useMemo(
    () => simulacoes.find((s) => s.contratoId != null) ?? null,
    [simulacoes],
  );

  /** A proposta viva, que é a que pode ser efetivada. */
  const proposta = useMemo(
    () => simulacoes.find((s) => s.status === "RASCUNHO" || s.status === "RESERVADA") ?? null,
    [simulacoes],
  );

  const { contrato: contratoCarregado, loading: carregandoContrato } = useContrato(
    convertida?.contratoId ?? null,
  );

  /**
   * A resposta da mutation vem primeiro: logo depois de efetivar ela já tem o
   * contrato inteiro, e esperar o refetch deixaria a tela em branco no momento
   * em que o funcionário mais quer ver o carnê.
   */
  const contrato = efetivar.data ?? contratoCarregado;

  function confirmarEfetivacao() {
    if (!proposta) return;
    efetivar.mutate(
      { simulacaoId: proposta.id },
      { onSuccess: () => setConfirmando(false) },
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <ReceiptLongOutlinedIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Efetivação da matrícula
        </Typography>
        {contrato && <Chip size="small" color="success" label={contrato.numero} />}
      </Stack>

      {carregandoSimulacoes || carregandoContrato ? (
        <Skeleton variant="rounded" height={160} />
      ) : contrato ? (
        <ContratoEfetivado contrato={contrato} />
      ) : proposta ? (
        <PropostaPronta
          proposta={proposta}
          anoLetivo={anoLetivo}
          onEfetivar={() => setConfirmando(true)}
        />
      ) : (
        <Alert severity="info">
          Não há proposta viva para este lead. Gere a proposta no bloco de bolsa acima — é dela que
          saem o preço, o desconto e o número de parcelas do contrato.
        </Alert>
      )}

      {proposta && (
        <Dialog open={confirmando} onClose={() => setConfirmando(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Efetivar a matrícula?</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Isto gera o contrato e as {proposta.qtdParcelas} parcelas, e transforma a reserva de
              bolsa em compromisso de orçamento. Para desfazer depois é preciso rescindir o contrato
              e cancelar as parcelas uma a uma.
            </Typography>

            <Linha rotulo="Ano letivo" valor={String(proposta.anoLetivo)} />
            <Linha
              rotulo="Parcelas"
              valor={`${proposta.qtdParcelas}x, vencendo dia ${proposta.diaVencimento}`}
            />
            <Divider sx={{ my: 1.5 }} />
            <Linha rotulo="Valor cheio do ano" valor={moeda(proposta.valorBruto)} />
            <Linha
              rotulo="Bolsa"
              valor={proposta.valorDesconto > 0 ? `− ${moeda(proposta.valorDesconto)}` : "sem bolsa"}
            />
            <Linha rotulo="A família paga" valor={moeda(proposta.valorLiquido)} destaque />

            {proposta.status === "RASCUNHO" && proposta.valorDesconto === 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Esta proposta não tem bolsa concedida. Se era para ter, conceda no bloco acima antes
                de efetivar: depois da efetivação a bolsa não entra mais neste contrato.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmando(false)} disabled={efetivar.isPending}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={confirmarEfetivacao}
              disabled={efetivar.isPending}
            >
              {efetivar.isPending ? "Efetivando..." : "Efetivar matrícula"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Paper>
  );
}

function Linha({
  rotulo,
  valor,
  destaque,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
      <Typography variant="body2" color="text.secondary">
        {rotulo}
      </Typography>
      <Typography variant="body2" fontWeight={destaque ? 700 : 500}>
        {valor}
      </Typography>
    </Stack>
  );
}

function PropostaPronta({
  proposta,
  anoLetivo,
  onEfetivar,
}: {
  proposta: SimulacaoResponse;
  anoLetivo: number;
  onEfetivar: () => void;
}) {
  const semBolsa = proposta.valorDesconto === 0;

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        <Chip
          size="small"
          label={proposta.status === "RESERVADA" ? "Bolsa reservada" : "Proposta em rascunho"}
          color={proposta.status === "RESERVADA" ? "primary" : "default"}
        />
        {proposta.reservaExpiraEm && (
          <Chip size="small" variant="outlined" label={`reserva até ${dataBR(proposta.reservaExpiraEm)}`} />
        )}
      </Stack>

      <Linha rotulo="Ano letivo" valor={String(proposta.anoLetivo)} />
      <Linha
        rotulo="Parcelas"
        valor={`${proposta.qtdParcelas}x, vencendo dia ${proposta.diaVencimento}`}
      />
      <Linha rotulo="Valor cheio do ano" valor={moeda(proposta.valorBruto)} />
      <Linha
        rotulo="Bolsa"
        valor={semBolsa ? "sem bolsa" : `− ${moeda(proposta.valorDesconto)}`}
      />
      <Linha rotulo="A família paga" valor={moeda(proposta.valorLiquido)} destaque />
      <Linha rotulo="Parcela média" valor={moeda(proposta.valorParcelaMedia)} />

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
        Parcela média é o líquido dividido pelas parcelas. Produto de cobrança única — matrícula,
        taxa de material — entra inteiro no valor do ano e aqui aparece diluído; o carnê exato sai
        na efetivação.
      </Typography>

      {proposta.anoLetivo !== anoLetivo && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          A proposta é do ano letivo {proposta.anoLetivo} e o lead está em {anoLetivo}. Confira antes
          de efetivar.
        </Alert>
      )}

      <Button variant="contained" onClick={onEfetivar} sx={{ mt: 2 }}>
        Efetivar matrícula
      </Button>
    </Box>
  );
}

function ContratoEfetivado({ contrato }: { contrato: ContratoResponse }) {
  /**
   * Parcelas reemitidas (versão > 1) convivem com as originais. Ordena por
   * vencimento e deixa a versão visível, senão a tela mostra duas linhas da
   * parcela 3 sem explicar a diferença.
   */
  const titulos = useMemo(
    () =>
      [...contrato.titulos].sort(
        (a, b) =>
          a.vencimento.localeCompare(b.vencimento) ||
          a.numeroParcela - b.numeroParcela ||
          a.versao - b.versao,
      ),
    [contrato.titulos],
  );

  return (
    <Box>
      {!contrato.carneFecha && (
        <Alert severity="error" sx={{ mb: 2 }}>
          A soma das parcelas ({moeda(contrato.somaDosTitulos)}) não fecha com o valor contratado (
          {moeda(contrato.valorLiquido)}). Não entregue este carnê à família antes de conferir.
        </Alert>
      )}

      <Linha rotulo="Contrato" valor={contrato.numero} />
      <Linha rotulo="Vigência" valor={`${dataBR(contrato.dataInicio)} a ${dataBR(contrato.dataFim)}`} />
      <Linha rotulo="Valor cheio do ano" valor={moeda(contrato.valorBruto)} />
      <Linha
        rotulo="Bolsa"
        valor={contrato.valorDesconto > 0 ? `− ${moeda(contrato.valorDesconto)}` : "sem bolsa"}
      />
      <Linha rotulo="A família paga" valor={moeda(contrato.valorLiquido)} destaque />

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
        Carnê · {titulos.length} parcelas
      </Typography>

      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Parcela</TableCell>
              <TableCell>Competência</TableCell>
              <TableCell>Vencimento</TableCell>
              <TableCell align="right">Valor cheio</TableCell>
              <TableCell align="right">Bolsa</TableCell>
              <TableCell align="right">A pagar</TableCell>
              <TableCell>Situação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {titulos.map((t) => (
              <LinhaDoCarne key={t.id} titulo={t} totalParcelas={contrato.qtdParcelas} />
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}

function LinhaDoCarne({
  titulo,
  totalParcelas,
}: {
  titulo: TituloResponse;
  totalParcelas: number;
}) {
  return (
    <TableRow>
      <TableCell>
        {titulo.numeroParcela}/{totalParcelas}
        {titulo.versao > 1 && (
          <Chip size="small" variant="outlined" label={`${titulo.versao}ª emissão`} sx={{ ml: 0.5 }} />
        )}
      </TableCell>
      <TableCell>{competenciaBR(titulo.competencia)}</TableCell>
      <TableCell>{dataBR(titulo.vencimento)}</TableCell>
      <TableCell align="right">{moeda(titulo.valorBruto)}</TableCell>
      <TableCell align="right">
        {titulo.valorDesconto > 0 ? `− ${moeda(titulo.valorDesconto)}` : "–"}
      </TableCell>
      <TableCell align="right">{moeda(titulo.valorLiquido)}</TableCell>
      <TableCell>
        <Chip
          size="small"
          label={titulo.vencido && titulo.status === "ABERTO" ? "Em atraso" : titulo.status}
          color={titulo.vencido && titulo.status === "ABERTO" ? "error" : CORES_STATUS[titulo.status]}
        />
      </TableCell>
    </TableRow>
  );
}
