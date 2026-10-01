"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useAluno } from "@/hooks/useAluno";
import { useBolsaTeto, useConcessoesDaSimulacao, useTiposBolsa } from "@/hooks/useBolsa";
import { useBolsaMutations } from "@/hooks/useBolsaMutations";
import { useSimulacoesDoProcesso } from "@/hooks/useSimulacoes";
import { LimiteAtingido, TetoConcessaoResponse } from "@/services/domains/bolsa";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function moeda(valor: number | null | undefined): string {
  return valor == null ? "–" : BRL.format(valor);
}

function pct(valor: number | null | undefined): string {
  return valor == null ? "–" : `${Number(valor).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}

interface Props {
  processoMatriculaId: number;
  alunoId: number;
  anoLetivo: number;
}

/**
 * Quanto de bolsa o funcionário pode conceder a este lead.
 *
 * Os três tetos aparecem separados de propósito, com o que está segurando em
 * destaque. Quando alguém vê "20%" e não entende por quê, a resposta é qual dos
 * três está mandando — e sem isso a tela vira caixa-preta e gera ligação para a
 * direção.
 */
export default function BlocoBolsaLead({ processoMatriculaId, alunoId, anoLetivo }: Props) {
  const { tipos, loading: carregandoTipos } = useTiposBolsa();
  const { aluno, loading: carregandoAluno } = useAluno(String(alunoId));
  const { simulacoes, loading: carregandoSimulacoes } = useSimulacoesDoProcesso(processoMatriculaId);
  const { criarSimulacao, reservar, liberar } = useBolsaMutations(processoMatriculaId);

  const [tipoBolsaId, setTipoBolsaId] = useState<number | "">("");
  const [percentual, setPercentual] = useState(0);
  const [motivo, setMotivo] = useState("");
  const [qtdParcelas, setQtdParcelas] = useState(12);
  const [diaVencimento, setDiaVencimento] = useState(10);

  /** A proposta viva é a mais recente que ainda aceita bolsa. */
  const simulacao = useMemo(
    () => simulacoes.find((s) => s.status === "RASCUNHO" || s.status === "RESERVADA") ?? null,
    [simulacoes],
  );

  const { concessoes } = useConcessoesDaSimulacao(simulacao?.id ?? null);
  const concessoesVigentes = concessoes.filter(
    (c) => c.status === "RESERVADA" || c.status === "ATIVA",
  );

  /**
   * O DTO do CRM traz serieNome, não serieId. O teto precisa dos ids numéricos,
   * então eles vêm do cadastro do aluno — e podem faltar, porque lead entra no
   * funil com cadastro mínimo.
   */
  const dimensoesOk = aluno?.serieId != null && aluno?.unidadeId != null;

  const paramsTeto = useMemo(() => {
    if (!dimensoesOk || tipoBolsaId === "") return null;
    return {
      anoLetivo,
      tipoBolsaId: Number(tipoBolsaId),
      unidadeId: aluno!.unidadeId!,
      serieId: aluno!.serieId!,
      qtdParcelas: simulacao?.qtdParcelas ?? qtdParcelas,
    };
  }, [dimensoesOk, tipoBolsaId, anoLetivo, aluno, simulacao?.qtdParcelas, qtdParcelas]);

  const { teto, loading: carregandoTeto, recalculando, error: erroTeto } = useBolsaTeto(paramsTeto);

  /**
   * Matriz e alçada NUNCA se excedem; envelope se excede com aprovação de quem tem
   * alçada para isso. Então o slider vai até o menor dos dois primeiros, e passar
   * do envelope é possível mas avisado.
   */
  const limiteDuro = teto ? Math.min(teto.tetoMatrizPct, teto.tetoAlcadaPct) : 0;
  const acimaDoOrcamento = teto != null && percentual > teto.tetoEnvelopePct;

  const valorConcedido = teto ? (teto.valorCheioAnual * percentual) / 100 : 0;

  function concederBolsa() {
    if (!simulacao || tipoBolsaId === "") return;
    reservar.mutate({
      simulacaoId: simulacao.id,
      tipoBolsaId: Number(tipoBolsaId),
      percentual,
      motivo: motivo.trim() || undefined,
    });
  }

  function gerarProposta() {
    if (!dimensoesOk) return;
    criarSimulacao.mutate({
      processoMatriculaId,
      alunoId,
      anoLetivo,
      unidadeId: aluno!.unidadeId!,
      serieId: aluno!.serieId!,
      qtdParcelas,
      diaVencimento,
    });
  }

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <SchoolOutlinedIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Bolsa de estudo
        </Typography>
        {recalculando && <Chip size="small" label="recalculando" />}
      </Stack>

      {carregandoAluno || carregandoSimulacoes ? (
        <Skeleton variant="rounded" height={180} />
      ) : !dimensoesOk ? (
        <Alert severity="info">
          Este lead ainda não tem série e unidade no cadastro. O teto de bolsa é calculado sobre o
          preço da série, então não há como simular antes de completar o cadastro do aluno.
        </Alert>
      ) : !simulacao ? (
        <ProponhaPrimeiro
          qtdParcelas={qtdParcelas}
          diaVencimento={diaVencimento}
          onQtdParcelas={setQtdParcelas}
          onDiaVencimento={setDiaVencimento}
          onGerar={gerarProposta}
          gerando={criarSimulacao.isPending}
        />
      ) : (
        <Stack spacing={2.5}>
          <ResumoProposta
            bruto={simulacao.valorBruto}
            desconto={simulacao.valorDesconto}
            liquido={simulacao.valorLiquido}
            parcelas={simulacao.qtdParcelas}
            parcelaMedia={simulacao.valorParcelaMedia}
            expiraEm={simulacao.reservaExpiraEm}
          />

          {concessoesVigentes.length > 0 && (
            <Stack spacing={1}>
              {concessoesVigentes.map((c) => (
                <Alert
                  key={c.id}
                  severity={c.excedeuEnvelope ? "warning" : "success"}
                  action={
                    <Button
                      size="small"
                      color="inherit"
                      disabled={liberar.isPending}
                      onClick={() => liberar.mutate({ simulacaoId: simulacao.id })}
                    >
                      Cancelar
                    </Button>
                  }
                >
                  {c.tipoBolsa} de {pct(c.percentual)} — {moeda(c.valorRenunciaAnual)} no ano
                  {c.excedeuEnvelope && " (acima do orçamento, com aprovação registrada)"}
                </Alert>
              ))}
            </Stack>
          )}

          <Divider />

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
              Tipo de bolsa
            </Typography>
            <Select<number | "">
              fullWidth
              size="small"
              displayEmpty
              value={tipoBolsaId}
              disabled={carregandoTipos}
              onChange={(e) => {
                const escolhido = e.target.value;
                setTipoBolsaId(escolhido === "" ? "" : Number(escolhido));
                // Zera o percentual: o teto do tipo anterior nao vale para o novo.
                setPercentual(0);
              }}
            >
              <MenuItem value="">
                <em>Selecione para ver quanto pode conceder</em>
              </MenuItem>
              {tipos.map((t) => (
                <MenuItem key={t.id} value={t.id} disabled={t.produtoIds.length === 0}>
                  {t.nome}
                  {t.produtoIds.length === 0 && " — sem produto configurado"}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {erroTeto && (
            <Alert severity="warning">
              Não foi possível calcular o teto. Normalmente é a política de bolsa de {anoLetivo} que
              ainda não foi configurada, ou o tipo de bolsa sem produto elegível.
            </Alert>
          )}

          {carregandoTeto && <Skeleton variant="rounded" height={160} />}

          {teto && !carregandoTeto && (
            <>
              <PainelTetos teto={teto} />

              {limiteDuro <= 0 ? (
                <Alert severity="warning">
                  Não há margem para conceder {teto.tipoBolsa} neste caso.{" "}
                  {teto.tetoMatrizPct <= 0
                    ? "A matriz de descontos não prevê esta bolsa para esta série."
                    : "Sua alçada não alcança nenhum percentual nesta política."}
                </Alert>
              ) : (
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                    <Typography variant="body2" color="text.secondary">
                      Percentual a conceder
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {pct(percentual)}{" "}
                      <Typography component="span" variant="body2" color="text.secondary">
                        · {moeda(valorConcedido)} no ano
                      </Typography>
                    </Typography>
                  </Stack>

                  <Slider
                    value={percentual}
                    min={0}
                    max={limiteDuro}
                    step={0.5}
                    marks={[
                      { value: 0, label: "0%" },
                      ...(teto.tetoEnvelopePct > 0 && teto.tetoEnvelopePct < limiteDuro
                        ? [{ value: teto.tetoEnvelopePct, label: "orçamento" }]
                        : []),
                      { value: limiteDuro, label: pct(limiteDuro) },
                    ]}
                    onChange={(_, v) => setPercentual(Array.isArray(v) ? v[0] : v)}
                  />

                  {acimaDoOrcamento && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Acima do que o orçamento comporta ({pct(teto.tetoEnvelopePct)}). Só passa com
                      alçada de direção, e fica registrado como excedente aprovado por você.
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    size="small"
                    label="Motivo"
                    placeholder="Ex.: renda familiar comprovada"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    sx={{ mt: 2 }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2 }}
                    disabled={percentual <= 0 || reservar.isPending}
                    onClick={concederBolsa}
                  >
                    {reservar.isPending ? "Concedendo..." : `Conceder ${pct(percentual)}`}
                  </Button>

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    A concessão segura orçamento por 15 dias. Se o lead não fechar, o valor volta
                    automaticamente para o bolo.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Stack>
      )}
    </Paper>
  );
}

/** Os três limites, com o que está segurando em destaque. */
function PainelTetos({ teto }: { teto: TetoConcessaoResponse }) {
  const linhas: { chave: LimiteAtingido; rotulo: string; valor: number; nota?: string }[] = [
    { chave: "MATRIZ", rotulo: "Matriz de descontos", valor: teto.tetoMatrizPct },
    { chave: "ALCADA", rotulo: "Sua alçada", valor: teto.tetoAlcadaPct },
    {
      chave: "ENVELOPE",
      rotulo: "Orçamento de bolsa",
      valor: teto.tetoEnvelopePct,
      nota: teto.envelopeRestritivo?.nome,
    },
  ];

  return (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: "action.hover" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1.5 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Pode conceder até
          </Typography>
          <Typography variant="h4" fontWeight={700} lineHeight={1.1}>
            {pct(teto.podeConcederPct)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {moeda(teto.podeConcederValor)} de {moeda(teto.valorCheioAnual)} no ano
          </Typography>
        </Box>
        <Tooltip title="Vale o menor dos três. Os três aparecem para você saber o que mudar se precisar de mais.">
          <InfoOutlinedIcon fontSize="small" color="disabled" />
        </Tooltip>
      </Stack>

      <Stack spacing={0.75}>
        {linhas.map((l) => {
          const segurando = teto.limiteAtingido === l.chave;
          return (
            <Stack key={l.chave} direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="body2"
                sx={{ flex: 1, fontWeight: segurando ? 700 : 400 }}
                color={segurando ? "text.primary" : "text.secondary"}
              >
                {l.rotulo}
                {l.nota && (
                  <Typography component="span" variant="caption" color="text.secondary">
                    {" "}
                    ({l.nota})
                  </Typography>
                )}
              </Typography>
              <Typography variant="body2" fontWeight={segurando ? 700 : 400}>
                {pct(l.valor)}
              </Typography>
              {segurando && <Chip size="small" color="primary" label="segurando" />}
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}

function ResumoProposta({
  bruto,
  desconto,
  liquido,
  parcelas,
  parcelaMedia,
  expiraEm,
}: {
  bruto: number;
  desconto: number;
  liquido: number;
  parcelas: number;
  parcelaMedia: number;
  expiraEm: string | null;
}) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          Anuidade cheia
        </Typography>
        <Typography variant="body2">{moeda(bruto)}</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          Bolsa
        </Typography>
        <Typography variant="body2" color={desconto > 0 ? "success.main" : "text.secondary"}>
          {desconto > 0 ? `− ${moeda(desconto)}` : "–"}
        </Typography>
      </Stack>
      <Divider sx={{ my: 0.75 }} />
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" fontWeight={600}>
          A pagar no ano
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {moeda(liquido)}
        </Typography>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {parcelas}x de {moeda(parcelaMedia)} em média — o carnê exato sai com os títulos
      </Typography>
      {expiraEm && (
        <Typography variant="caption" color="warning.main" sx={{ display: "block" }}>
          Reserva de orçamento válida até {new Date(expiraEm).toLocaleDateString("pt-BR")}
        </Typography>
      )}
    </Box>
  );
}

/**
 * Sem proposta não há onde pendurar a bolsa: a concessão aponta para a simulação.
 * Então o primeiro passo é montar a proposta a partir do catálogo vigente.
 */
function ProponhaPrimeiro({
  qtdParcelas,
  diaVencimento,
  onQtdParcelas,
  onDiaVencimento,
  onGerar,
  gerando,
}: {
  qtdParcelas: number;
  diaVencimento: number;
  onQtdParcelas: (v: number) => void;
  onDiaVencimento: (v: number) => void;
  onGerar: () => void;
  gerando: boolean;
}) {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Gere a proposta a partir da tabela de preços vigente para ver quanto de bolsa cabe. Os
        valores vêm do catálogo, não são digitados.
      </Typography>
      <Stack direction="row" spacing={2}>
        <TextField
          select
          fullWidth
          size="small"
          label="Parcelas"
          value={qtdParcelas}
          onChange={(e) => onQtdParcelas(Number(e.target.value))}
        >
          {[12, 11, 10, 6, 1].map((n) => (
            <MenuItem key={n} value={n}>
              {n}x
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          fullWidth
          size="small"
          label="Vencimento"
          value={diaVencimento}
          onChange={(e) => onDiaVencimento(Number(e.target.value))}
        >
          {[5, 10, 15, 20, 25].map((d) => (
            <MenuItem key={d} value={d}>
              dia {d}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <Button variant="contained" onClick={onGerar} disabled={gerando}>
        {gerando ? "Gerando..." : "Gerar proposta"}
      </Button>
    </Stack>
  );
}
