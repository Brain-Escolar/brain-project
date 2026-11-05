"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { usePrecosPendentes } from "@/hooks/useAprovacaoPreco";
import { PrecoResponse } from "@/services/domains/produto";
import DialogDecisaoPreco from "./_components/DialogDecisaoPreco";

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

/** O escopo em palavras. Preço geral não tem dimensão nenhuma preenchida. */
function escopo(p: PrecoResponse): string {
  const partes = [
    p.anoLetivo ? String(p.anoLetivo) : null,
    p.unidadeNome,
    p.serieNome,
    p.turno,
  ].filter(Boolean);
  return partes.length === 0 ? "preço geral" : partes.join(" · ");
}

/**
 * A fila de aprovacao de preco.
 *
 * Existe porque reajuste nao e cadastro, e decisao: quem muda o preco muda a
 * receita do ano inteiro. Antes desta tela, qualquer um com acesso ao catalogo
 * mudava sozinho e nao sobrava rastro de quem decidiu.
 *
 * O pedido pendente NAO cobra ninguem -- as consultas que a proposta usa so
 * devolvem preco aprovado. Entao pedido esquecido aqui nao gera boleto errado;
 * ele so nao entra em vigor, e o preco antigo continua valendo.
 */
export default function AprovacaoPrecoPage() {
  const { pendentes, loading } = usePrecosPendentes();
  const [emDecisao, setEmDecisao] = useState<PrecoResponse | null>(null);

  return (
    <PageScaffold
      title="Aprovação de preço"
      description="Reajustes pedidos no catálogo, esperando decisão para entrar em vigor."
    >
      {loading ? (
        <Skeleton variant="rounded" height={260} />
      ) : pendentes.length === 0 ? (
        <Alert severity="success">
          Nenhum reajuste esperando decisão. Preços cadastrados no catálogo aparecem aqui
          automaticamente, e só passam a valer depois de aprovados.
        </Alert>
      ) : (
        <>
          <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              {pendentes.length === 1
                ? "1 reajuste esperando"
                : `${pendentes.length} reajustes esperando`}
              {" · "}
              enquanto não houver decisão, o preço anterior continua sendo o preço
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Produto</TableCell>
                    <TableCell>Escopo</TableCell>
                    <TableCell align="right">Valor pedido</TableCell>
                    <TableCell>Vigência</TableCell>
                    <TableCell>Pedido por</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendentes.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.produtoNome ?? p.modalidadeNome ?? "—"}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {escopo(p)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip size="small" color="warning" label={moeda(p.valor)} />
                      </TableCell>
                      <TableCell>
                        {dataBR(p.vigenciaInicio)}
                        {p.vigenciaFim ? ` a ${dataBR(p.vigenciaFim)}` : " sem fim"}
                      </TableCell>
                      <TableCell>{p.solicitadoPor ?? "—"}</TableCell>
                      <TableCell align="right">
                        <Button size="small" variant="contained" onClick={() => setEmDecisao(p)}>
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
            Quem pediu o reajuste não aprova o próprio pedido. A sobreposição de vigência é
            reconferida na hora da decisão — se outro preço entrou no mesmo escopo nesse meio-tempo,
            a aprovação é recusada aqui, e é o lugar certo para descobrir.
          </Typography>
        </>
      )}

      <DialogDecisaoPreco preco={emDecisao} onClose={() => setEmDecisao(null)} />
    </PageScaffold>
  );
}
