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
import { useAprovacaoPrecoMutations } from "@/hooks/useAprovacaoPreco";
import { PrecoResponse } from "@/services/domains/produto";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const MINIMO_MOTIVO = 5;

function dataBR(iso: string | null | undefined): string {
  if (!iso) return "–";
  const [ano, mes, dia] = iso.split("-");
  if (!ano || !mes || !dia) return "–";
  return `${dia}/${mes}/${ano}`;
}

interface Props {
  preco: PrecoResponse | null;
  onClose: () => void;
}

/**
 * Aprovar ou recusar um reajuste.
 *
 * Nao ha campo de valor de proposito. Aprovar e aprovar o que foi pedido, nao
 * negociar um terceiro numero no ato da decisao: preco diferente e outro pedido,
 * e assim os dois ficam na tabela e o historico continua inteiro -- que e a
 * unica resposta, em seis meses, para "por que o preco deste ano e esse".
 */
export default function DialogDecisaoPreco({ preco, onClose }: Props) {
  const { aprovar, rejeitar } = useAprovacaoPrecoMutations();

  const [observacao, setObservacao] = useState("");
  const [motivoRecusa, setMotivoRecusa] = useState("");
  const [recusando, setRecusando] = useState(false);

  useEffect(() => {
    if (preco) {
      setObservacao("");
      setMotivoRecusa("");
      setRecusando(false);
    }
  }, [preco]);

  if (!preco) return null;

  const motivoCurto = motivoRecusa.trim().length < MINIMO_MOTIVO;
  const ocupado = aprovar.isPending || rejeitar.isPending;

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {preco.produtoNome ?? "Reajuste de preço"}
        {preco.modalidadeNome ? ` · ${preco.modalidadeNome}` : ""}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="body2">
            Pedido: <strong>{BRL.format(preco.valor)}</strong>, a partir de{" "}
            {dataBR(preco.vigenciaInicio)}
            {preco.vigenciaFim ? ` até ${dataBR(preco.vigenciaFim)}` : " sem fim definido"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pedido por {preco.solicitadoPor ?? "—"}
          </Typography>
          {preco.anoLetivo && (
            <Typography variant="body2" color="text.secondary">
              Ano letivo {preco.anoLetivo}
              {preco.unidadeNome ? ` · ${preco.unidadeNome}` : ""}
              {preco.serieNome ? ` · ${preco.serieNome}` : ""}
              {preco.turno ? ` · ${preco.turno}` : ""}
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
              placeholder="Acima do reajuste aprovado em conselho para este ano"
              helperText="É o que explica, em seis meses, por que o preço deste ano é esse."
              error={motivoRecusa.length > 0 && motivoCurto}
              multiline
              minRows={2}
              fullWidth
            />
            <Alert severity="info">
              Recusar encerra o pedido e não muda nada: o preço atual continua valendo. Para um
              valor diferente, quem opera o catálogo cadastra outro reajuste.
            </Alert>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <TextField
              label="Observação"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Reajuste INPC acordado em conselho"
              multiline
              minRows={2}
              fullWidth
            />
            <Alert severity="warning">
              Aprovar faz este preço valer a partir de {dataBR(preco.vigenciaInicio)} e encerra o
              anterior no dia anterior. Propostas feitas daí em diante usam este valor; as já
              fechadas guardam o preço com que foram vendidas e não mudam.
            </Alert>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose} disabled={ocupado}>
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
                  { precoId: preco.id, motivo: motivoRecusa.trim() },
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
              disabled={aprovar.isPending}
              onClick={() =>
                aprovar.mutate(
                  { precoId: preco.id, motivo: observacao.trim() || undefined },
                  { onSuccess: onClose },
                )
              }
            >
              {aprovar.isPending ? "Aprovando..." : "Aprovar reajuste"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
