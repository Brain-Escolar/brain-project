"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { usePagamentosDoTitulo } from "@/hooks/useFinanceiro";
import { useFinanceiroMutations } from "@/hooks/useFinanceiroMutations";
import { ParcelaParaBaixa } from "./ParcelaParaBaixa";
import { dataBR, moeda } from "./formatos";

const MINIMO_MOTIVO = 5;

interface Props {
  parcela: ParcelaParaBaixa | null;
  onClose: () => void;
}

/**
 * Desfaz uma baixa.
 *
 * Duas coisas aqui não são burocracia. O motivo, porque estorno tira dinheiro de
 * um caixa já fechado e seis meses depois alguém vai perguntar por quê — "cheque
 * devolvido", "baixa no aluno errado" e "pagamento em duplicidade" são respostas
 * com consequências diferentes. E a reemissão ligada por padrão, porque o título
 * estornado não volta para ABERTO: sem reemitir, a dívida desaparece do contas a
 * receber e ninguém descobre até o fim do ano.
 */
export default function DialogEstorno({ parcela, onClose }: Props) {
  const { pagamentos, loading } = usePagamentosDoTitulo(parcela?.tituloId ?? null);
  const { estornar } = useFinanceiroMutations();

  const [motivo, setMotivo] = useState("");
  const [reemitir, setReemitir] = useState(true);
  const [novoVencimento, setNovoVencimento] = useState("");

  useEffect(() => {
    if (parcela) {
      setMotivo("");
      setReemitir(true);
      setNovoVencimento("");
    }
  }, [parcela]);

  /** A baixa que ainda vale. Estornadas aparecem no histórico, não aqui. */
  const pagamentoVivo = useMemo(() => pagamentos.find((p) => !p.estornado) ?? null, [pagamentos]);

  if (!parcela) return null;

  const motivoCurto = motivo.trim().length < MINIMO_MOTIVO;

  function confirmar() {
    if (!pagamentoVivo) return;
    estornar.mutate(
      {
        pagamentoId: pagamentoVivo.id,
        dados: {
          motivo: motivo.trim(),
          reemitir,
          novoVencimento: reemitir && novoVencimento ? novoVencimento : undefined,
        },
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Estornar a baixa da parcela {parcela.numeroParcela}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Skeleton variant="rounded" height={160} />
        ) : !pagamentoVivo ? (
          <Alert severity="warning">
            Esta parcela não tem baixa ativa para estornar. Se havia uma, ela já foi estornada
            antes.
          </Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {parcela.alunoNome ? `${parcela.alunoNome} · ` : ""}
              baixa de {moeda(pagamentoVivo.valorPago)} em {dataBR(pagamentoVivo.dataPagamento)} (
              {pagamentoVivo.forma})
              {pagamentoVivo.registradoPor ? `, por ${pagamentoVivo.registradoPor}` : ""}
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Motivo do estorno"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Cheque devolvido pelo banco"
                helperText="Fica no registro. Em seis meses é o que explica o buraco no caixa daquele dia."
                error={motivo.length > 0 && motivoCurto}
                multiline
                minRows={2}
                fullWidth
              />

              <FormControlLabel
                control={
                  <Switch checked={reemitir} onChange={(e) => setReemitir(e.target.checked)} />
                }
                label="Reemitir a parcela"
              />

              {reemitir ? (
                <TextField
                  label="Vencimento da parcela reemitida"
                  type="date"
                  value={novoVencimento}
                  onChange={(e) => setNovoVencimento(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  helperText="Em branco, mantém o vencimento original se ainda não passou; se passou, usa hoje."
                  fullWidth
                />
              ) : (
                <Alert severity="warning">
                  Sem reemissão, esta parcela sai do contas a receber e não será mais cobrada. Isso
                  só está certo se a dívida existe em outro contrato — caso de baixa lançada no
                  aluno errado.
                </Alert>
              )}
            </Stack>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={estornar.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={confirmar}
          disabled={!pagamentoVivo || motivoCurto || estornar.isPending}
        >
          {estornar.isPending ? "Estornando..." : "Estornar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
