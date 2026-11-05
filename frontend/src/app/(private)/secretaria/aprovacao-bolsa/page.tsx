"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
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
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { usePendentesDeAprovacao } from "@/hooks/useAprovacaoBolsa";
import { ConcessaoBolsaResponse } from "@/services/domains/bolsa";
import DialogDecisaoBolsa from "./_components/DialogDecisaoBolsa";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function moeda(valor: number | null | undefined): string {
  return valor == null ? "–" : BRL.format(valor);
}

function pct(valor: number | null | undefined): string {
  return valor == null ? "–" : `${Number(valor).toLocaleString("pt-BR")}%`;
}

/**
 * A fila de aprovacao de bolsa.
 *
 * Existe porque a alcada nao e um limite, e quem decide. Ate agora, pedir acima
 * da alcada dava erro -- e a mensagem do erro prometia "encaminhe para aprovacao
 * da direcao", sem haver para onde encaminhar. O funcionario ficava com a
 * familia na frente, sabendo que alguem poderia aprovar, e sem como pedir.
 *
 * Quem pediu nao aparece como quem pode decidir: o backend recusa o proprio
 * solicitante. Sem isso, qualquer um com acesso a esta tela teria alcada
 * infinita -- bastaria pedir e aprovar.
 */
export default function AprovacaoBolsaPage() {
  const { pendentes, loading } = usePendentesDeAprovacao();
  const [emDecisao, setEmDecisao] = useState<ConcessaoBolsaResponse | null>(null);

  const totalEmJogo = pendentes.reduce((soma, c) => soma + (c.valorRenunciaAnual ?? 0), 0);

  return (
    <PageScaffold
      title="Aprovação de bolsa"
      description="Pedidos acima da alçada de quem fez a proposta, esperando decisão."
    >
      {loading ? (
        <Skeleton variant="rounded" height={280} />
      ) : pendentes.length === 0 ? (
        <Alert severity="success">
          Nenhum pedido esperando decisão. Pedidos acima da alçada de quem fez a proposta aparecem
          aqui automaticamente.
        </Alert>
      ) : (
        <>
          <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              {pendentes.length === 1 ? "1 pedido esperando" : `${pendentes.length} pedidos esperando`}
              {" · "}
              {moeda(totalEmJogo)} de renúncia de receita em jogo no ano
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Aluno</TableCell>
                    <TableCell>Série</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Pedido</TableCell>
                    <TableCell align="right">Renúncia no ano</TableCell>
                    <TableCell>Pedido por</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendentes.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.alunoNome ?? "—"}</TableCell>
                      <TableCell>{c.serieNome ?? "—"}</TableCell>
                      <TableCell>{c.tipoBolsa}</TableCell>
                      <TableCell align="right">
                        <Chip size="small" color="warning" label={pct(c.percentualPedido)} />
                      </TableCell>
                      <TableCell align="right">{moeda(c.valorRenunciaAnual)}</TableCell>
                      <TableCell>
                        <Stack>
                          <Typography variant="body2">{c.solicitadoPor ?? "—"}</Typography>
                          {c.motivo && (
                            <Typography variant="caption" color="text.secondary">
                              {c.motivo}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" variant="contained" onClick={() => setEmDecisao(c)}>
                          Decidir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
            Pedido pendente não segura orçamento. O teto é recalculado na hora da decisão, contra o
            envelope daquele momento — então um pedido antigo pode não caber mais, e você descobre
            aqui.
          </Typography>
        </>
      )}

      <DialogDecisaoBolsa concessao={emDecisao} onClose={() => setEmDecisao(null)} />
    </PageScaffold>
  );
}
