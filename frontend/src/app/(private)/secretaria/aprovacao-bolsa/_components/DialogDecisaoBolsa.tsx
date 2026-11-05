"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAprovacaoBolsaMutations } from "@/hooks/useAprovacaoBolsa";
import { ConcessaoBolsaResponse } from "@/services/domains/bolsa";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const MINIMO_MOTIVO = 5;

function moeda(valor: number | null | undefined): string {
  return valor == null ? "–" : BRL.format(valor);
}

interface Props {
  concessao: ConcessaoBolsaResponse | null;
  onClose: () => void;
}

/**
 * Aprovar, aprovar menos, ou recusar.
 *
 * O campo de percentual vem preenchido com o que foi pedido, e e editavel: o
 * caso comum da negociacao e "pediu 30, saiu 25", e os dois numeros ficam
 * guardados lado a lado. Recusar exige motivo -- e o que a secretaria vai dizer
 * a familia, e em seis meses e a unica resposta para "por que aquele aluno nao
 * teve bolsa".
 */
export default function DialogDecisaoBolsa({ concessao, onClose }: Props) {
  const { aprovar, rejeitar } = useAprovacaoBolsaMutations();

  const [percentual, setPercentual] = useState("");
  const [observacao, setObservacao] = useState("");
  const [motivoRecusa, setMotivoRecusa] = useState("");
  const [recusando, setRecusando] = useState(false);

  useEffect(() => {
    if (concessao) {
      setPercentual(String(concessao.percentualPedido ?? concessao.percentual));
      setObservacao("");
      setMotivoRecusa("");
      setRecusando(false);
    }
  }, [concessao]);

  if (!concessao) return null;

  const pedido = concessao.percentualPedido ?? concessao.percentual;
  const numero = percentual.trim() === "" ? null : Number(percentual.replace(",", "."));
  const invalido = numero == null || Number.isNaN(numero) || numero <= 0 || numero > 100;
  const cortando = !invalido && numero! < pedido;

  /**
   * A renúncia mostrada é proporcional ao que foi estimado no pedido. É
   * estimativa: o backend recalcula contra o valor cheio e o envelope do
   * momento da decisão, e pode recusar se não couber mais.
   */
  const renunciaEstimada =
    invalido || pedido === 0 ? null : (concessao.valorRenunciaAnual * numero!) / pedido;

  const motivoCurto = motivoRecusa.trim().length < MINIMO_MOTIVO;

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {concessao.alunoNome ?? "Pedido de bolsa"}
        {concessao.serieNome ? ` · ${concessao.serieNome}` : ""}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {concessao.tipoBolsa} · pedido por {concessao.solicitadoPor ?? "—"}
          </Typography>
          <Typography variant="body2">
            Pediu <strong>{pedido}%</strong> — {moeda(concessao.valorRenunciaAnual)} de renúncia no
            ano
          </Typography>
          {concessao.motivo && (
            <Typography variant="body2" color="text.secondary">
              Justificativa: {concessao.motivo}
            </Typography>
          )}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {recusando ? (
          <Stack spacing={2}>
            <TextField
              label="Motivo da recusa"
              value={motivoRecusa}
              onChange={(e) => setMotivoRecusa(e.target.value)}
              placeholder="Fora da política para esta série neste ano"
              helperText="É o que a secretaria vai dizer à família."
              error={motivoRecusa.length > 0 && motivoCurto}
              multiline
              minRows={2}
              fullWidth
            />
            <Alert severity="warning">
              Recusar encerra o pedido. Para conceder um valor menor em vez de recusar, volte e
              aprove com o percentual que couber.
            </Alert>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <TextField
              label="Percentual aprovado"
              value={percentual}
              onChange={(e) => setPercentual(e.target.value)}
              helperText={
                renunciaEstimada == null
                  ? "Pode aprovar menos do que foi pedido."
                  : `Aproximadamente ${moeda(renunciaEstimada)} de renúncia no ano.`
              }
              error={percentual.trim() !== "" && invalido}
              fullWidth
            />

            <TextField
              label="Observação"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Irmão já bolsista, renda comprovada"
              multiline
              minRows={2}
              fullWidth
            />

            {cortando && (
              <Alert severity="info">
                Aprovando {numero}% em vez dos {pedido}% pedidos. Os dois números ficam
                registrados, e quem fez a proposta vai ver o valor aprovado.
              </Alert>
            )}

            <Alert severity="info">
              O teto é recalculado agora, contra o envelope deste momento. Se o orçamento já tiver
              sido consumido desde o pedido, a aprovação será recusada aqui — e é o lugar certo
              para descobrir.
            </Alert>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose} disabled={aprovar.isPending || rejeitar.isPending}>
          Cancelar
        </Button>

        {recusando ? (
          <>
            <Button variant="outlined" onClick={() => setRecusando(false)} disabled={rejeitar.isPending}>
              Voltar
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={motivoCurto || rejeitar.isPending}
              onClick={() =>
                rejeitar.mutate(
                  { concessaoId: concessao.id, motivo: motivoRecusa.trim() },
                  { onSuccess: onClose },
                )
              }
            >
              {rejeitar.isPending ? "Recusando..." : "Confirmar recusa"}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outlined" color="error" onClick={() => setRecusando(true)}>
              Recusar
            </Button>
            <Button
              variant="contained"
              disabled={invalido || aprovar.isPending}
              onClick={() =>
                aprovar.mutate(
                  {
                    concessaoId: concessao.id,
                    decisao: {
                      percentualAprovado: numero!,
                      observacao: observacao.trim() || undefined,
                    },
                  },
                  { onSuccess: onClose },
                )
              }
            >
              {aprovar.isPending ? "Aprovando..." : "Aprovar"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
