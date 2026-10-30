"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useAlunos } from "@/hooks/useAlunos";
import { useContratosDoAluno } from "@/hooks/useContrato";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { ContratoResponse, StatusTitulo, TituloResponse } from "@/services/domains/contrato";
import { ParcelaParaBaixa } from "./ParcelaParaBaixa";
import { competenciaBR, dataBR, moeda } from "./formatos";

const MIN_BUSCA = 2;

const CORES_STATUS: Record<StatusTitulo, "default" | "success" | "warning" | "error"> = {
  ABERTO: "default",
  PAGO: "success",
  CANCELADO: "default",
  ESTORNADO: "error",
  RENEGOCIADO: "warning",
};

interface Props {
  onBaixar: (parcela: ParcelaParaBaixa) => void;
  onEstornar: (parcela: ParcelaParaBaixa) => void;
}

/**
 * O carnê de um aluno, para dar baixa em qualquer parcela.
 *
 * Esta aba existe porque a de inadimplência só lista o que está em atraso, e o
 * caso comum é o oposto: o pai que chega pagando a parcela do mês, em dia. Sem
 * este caminho a secretaria não teria onde registrar isso.
 */
export default function AbaCarneDoAluno({ onBaixar, onEstornar }: Props) {
  const [busca, setBusca] = useState("");
  const [alunoSelecionado, setAlunoSelecionado] = useState<{ id: number; nome: string } | null>(
    null,
  );

  const buscaDebounced = useDebouncedValue(busca, 400);
  const termoSuficiente = buscaDebounced.trim().length >= MIN_BUSCA;

  const { alunos, loading: buscando } = useAlunos(
    { busca: buscaDebounced.trim(), size: 8 },
    { enabled: termoSuficiente && alunoSelecionado === null },
  );

  const { contratos, loading: carregandoContratos } = useContratosDoAluno(
    alunoSelecionado?.id ?? null,
  );

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 2.5, mb: 2.5 }}>
        <TextField
          label="Buscar aluno"
          placeholder="Nome ou matrícula"
          value={alunoSelecionado ? alunoSelecionado.nome : busca}
          onChange={(e) => {
            setAlunoSelecionado(null);
            setBusca(e.target.value);
          }}
          fullWidth
        />

        {!alunoSelecionado && termoSuficiente && (
          <Box sx={{ mt: 1 }}>
            {buscando ? (
              <Skeleton variant="rounded" height={80} />
            ) : alunos.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nenhum aluno encontrado.
              </Typography>
            ) : (
              <List dense disablePadding>
                {alunos.map((a) => (
                  <ListItemButton
                    key={a.id}
                    onClick={() => setAlunoSelecionado({ id: a.id, nome: a.nome })}
                  >
                    {/* Matrícula e série desempatam homônimo — e escola tem homônimo. */}
                    <ListItemText
                      primary={a.nome}
                      secondary={[a.matricula, a.serie, a.turma].filter(Boolean).join(" · ")}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
        )}
      </Paper>

      {!alunoSelecionado ? (
        <Alert severity="info">
          Busque o aluno para abrir o carnê. A baixa é lançada na parcela, então é por aqui que se
          registra o pagamento de quem está em dia.
        </Alert>
      ) : carregandoContratos ? (
        <Skeleton variant="rounded" height={280} />
      ) : contratos.length === 0 ? (
        <Alert severity="warning">
          {alunoSelecionado.nome} não tem contrato. A matrícula precisa ser efetivada no CRM antes
          de existir carnê.
        </Alert>
      ) : (
        <Stack spacing={2.5}>
          {contratos.map((c) => (
            <CarneDoContrato
              key={c.id}
              contrato={c}
              alunoNome={alunoSelecionado.nome}
              onBaixar={onBaixar}
              onEstornar={onEstornar}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

function CarneDoContrato({
  contrato,
  alunoNome,
  onBaixar,
  onEstornar,
}: {
  contrato: ContratoResponse;
  alunoNome: string;
  onBaixar: (parcela: ParcelaParaBaixa) => void;
  onEstornar: (parcela: ParcelaParaBaixa) => void;
}) {
  const titulos = [...contrato.titulos].sort(
    (a, b) =>
      a.vencimento.localeCompare(b.vencimento) ||
      a.numeroParcela - b.numeroParcela ||
      a.versao - b.versao,
  );

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {contrato.numero}
        </Typography>
        <Chip
          size="small"
          label={contrato.status}
          color={contrato.status === "VIGENTE" ? "success" : "default"}
        />
      </Stack>

      <Typography variant="body2" color="text.secondary">
        {dataBR(contrato.dataInicio)} a {dataBR(contrato.dataFim)} · {contrato.qtdParcelas}x ·
        a família paga {moeda(contrato.valorLiquido)}
        {contrato.valorDesconto > 0 ? ` (bolsa de ${moeda(contrato.valorDesconto)})` : ""}
      </Typography>

      {!contrato.carneFecha && (
        <Alert severity="error" sx={{ mt: 2 }}>
          A soma das parcelas ({moeda(contrato.somaDosTitulos)}) não fecha com o valor contratado (
          {moeda(contrato.valorLiquido)}). Confira antes de cobrar.
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />

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
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {titulos.map((t) => (
              <LinhaDoCarne
                key={t.id}
                titulo={t}
                totalParcelas={contrato.qtdParcelas}
                alunoNome={alunoNome}
                contratoNumero={contrato.numero}
                onBaixar={onBaixar}
                onEstornar={onEstornar}
              />
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}

function LinhaDoCarne({
  titulo,
  totalParcelas,
  alunoNome,
  contratoNumero,
  onBaixar,
  onEstornar,
}: {
  titulo: TituloResponse;
  totalParcelas: number;
  alunoNome: string;
  contratoNumero: string;
  onBaixar: (parcela: ParcelaParaBaixa) => void;
  onEstornar: (parcela: ParcelaParaBaixa) => void;
}) {
  const parcela: ParcelaParaBaixa = {
    tituloId: titulo.id,
    numeroParcela: titulo.numeroParcela,
    vencimento: titulo.vencimento,
    valorLiquido: titulo.valorLiquido,
    alunoNome,
    contratoNumero,
  };

  const emAtraso = titulo.vencido && titulo.status === "ABERTO";

  return (
    <TableRow>
      <TableCell>
        {titulo.numeroParcela}/{totalParcelas}
        {titulo.versao > 1 && (
          <Chip
            size="small"
            variant="outlined"
            label={`${titulo.versao}ª emissão`}
            sx={{ ml: 0.5 }}
          />
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
          label={emAtraso ? "Em atraso" : titulo.status}
          color={emAtraso ? "error" : CORES_STATUS[titulo.status]}
        />
      </TableCell>
      <TableCell align="right">
        {titulo.status === "ABERTO" && (
          <Button size="small" variant="outlined" onClick={() => onBaixar(parcela)}>
            Dar baixa
          </Button>
        )}
        {titulo.status === "PAGO" && (
          <Button size="small" color="error" onClick={() => onEstornar(parcela)}>
            Estornar
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
