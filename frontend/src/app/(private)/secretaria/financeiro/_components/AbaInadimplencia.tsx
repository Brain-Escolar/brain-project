"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
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
import { useInadimplencia } from "@/hooks/useFinanceiro";
import { useUnidades } from "@/hooks/useUnidades";
import { FaixaAging } from "@/services/domains/financeiro";
import { ParcelaParaBaixa } from "./ParcelaParaBaixa";
import { dataBR, hojeISO, moeda, pct } from "./formatos";

const CORES_FAIXA: Record<FaixaAging, "default" | "warning" | "error"> = {
  A_VENCER: "default",
  ATE_30: "warning",
  DE_31_A_60: "warning",
  DE_61_A_90: "error",
  ACIMA_DE_90: "error",
};

interface Props {
  onBaixar: (parcela: ParcelaParaBaixa) => void;
}

/**
 * Inadimplência com aging.
 *
 * A carteira inteira aparece junto do atraso de propósito: 40 mil em atraso é
 * notícia muito diferente se a carteira é 200 mil ou 2 milhões, e o número
 * sozinho não diz qual dos dois é.
 */
export default function AbaInadimplencia({ onBaixar }: Props) {
  const { unidades } = useUnidades();
  const [unidadeId, setUnidadeId] = useState("");
  const [anoLetivo, setAnoLetivo] = useState(String(new Date().getFullYear()));
  const [referencia, setReferencia] = useState(hojeISO());

  const filtro = useMemo(
    () => ({
      unidadeId: unidadeId === "" ? undefined : Number(unidadeId),
      anoLetivo: anoLetivo.trim() === "" ? undefined : Number(anoLetivo),
      referencia: referencia || undefined,
    }),
    [unidadeId, anoLetivo, referencia],
  );

  const { relatorio, loading, recarregando } = useInadimplencia(filtro);

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 2.5, mb: 2.5 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            select
            label="Unidade"
            value={unidadeId}
            onChange={(e) => setUnidadeId(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todas</MenuItem>
            {unidades.map((u) => (
              <MenuItem key={u.id} value={String(u.id)}>
                {u.nome}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Ano letivo"
            value={anoLetivo}
            onChange={(e) => setAnoLetivo(e.target.value)}
            sx={{ maxWidth: 140 }}
          />

          <TextField
            label="Posição em"
            type="date"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Reabre o fechamento de um mês passado com os números daquele dia."
          />

          {recarregando && <Chip size="small" label="atualizando" sx={{ alignSelf: "center" }} />}
        </Stack>
      </Paper>

      {loading ? (
        <Skeleton variant="rounded" height={320} />
      ) : !relatorio ? (
        <Alert severity="info">Sem dados para este filtro.</Alert>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: 2,
              mb: 2.5,
            }}
          >
            <Indicador rotulo="Carteira aberta" valor={moeda(relatorio.carteiraAberta)} />
            <Indicador
              rotulo="Em atraso"
              valor={moeda(relatorio.totalEmAtraso)}
              detalhe={`${pct(relatorio.percentualEmAtraso)} da carteira`}
              alerta={relatorio.totalEmAtraso > 0}
            />
            <Indicador
              rotulo="Parcelas em atraso"
              valor={String(relatorio.parcelasEmAtraso)}
              detalhe={`${relatorio.alunosEmAtraso} aluno(s)`}
            />
            <Indicador rotulo="A vencer" valor={moeda(relatorio.totalAVencer)} />
          </Box>

          <Paper variant="outlined" sx={{ p: 2.5, mb: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Aging
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Faixa</TableCell>
                    <TableCell align="right">Parcelas</TableCell>
                    <TableCell align="right">Valor</TableCell>
                    <TableCell align="right">% da carteira</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {relatorio.faixas.map((f) => (
                    <TableRow key={f.faixa}>
                      <TableCell>
                        <Chip size="small" label={f.rotulo} color={CORES_FAIXA[f.faixa]} />
                      </TableCell>
                      <TableCell align="right">{f.quantidadeDeParcelas}</TableCell>
                      <TableCell align="right">{moeda(f.valor)}</TableCell>
                      <TableCell align="right">{pct(f.percentualDaCarteira)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Quem ligar · {relatorio.linhas.length} parcelas
            </Typography>

            {relatorio.linhas.length === 0 ? (
              <Alert severity="success">
                Nenhuma parcela em atraso nesta posição. Nada a cobrar.
              </Alert>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Aluno</TableCell>
                      <TableCell>Responsável</TableCell>
                      <TableCell>Contrato</TableCell>
                      <TableCell align="right">Parcela</TableCell>
                      <TableCell>Vencimento</TableCell>
                      <TableCell align="right">Atraso</TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relatorio.linhas.map((l) => (
                      <TableRow key={l.tituloId}>
                        <TableCell>{l.alunoNome ?? "—"}</TableCell>
                        <TableCell>{l.responsavelNome ?? "—"}</TableCell>
                        <TableCell>{l.contratoNumero}</TableCell>
                        <TableCell align="right">{l.numeroParcela}</TableCell>
                        <TableCell>{dataBR(l.vencimento)}</TableCell>
                        <TableCell align="right">
                          <Chip
                            size="small"
                            label={`${l.diasDeAtraso}d`}
                            color={CORES_FAIXA[l.faixa]}
                          />
                        </TableCell>
                        <TableCell align="right">{moeda(l.valorLiquido)}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              onBaixar({
                                tituloId: l.tituloId,
                                numeroParcela: l.numeroParcela,
                                vencimento: l.vencimento,
                                valorLiquido: l.valorLiquido,
                                alunoNome: l.alunoNome,
                                contratoNumero: l.contratoNumero,
                              })
                            }
                          >
                            Dar baixa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
}

function Indicador({
  rotulo,
  valor,
  detalhe,
  alerta,
}: {
  rotulo: string;
  valor: string;
  detalhe?: string;
  alerta?: boolean;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="caption" color="text.secondary">
        {rotulo}
      </Typography>
      <Typography variant="h6" fontWeight={700} color={alerta ? "error.main" : "text.primary"}>
        {valor}
      </Typography>
      {detalhe && (
        <Typography variant="caption" color="text.secondary">
          {detalhe}
        </Typography>
      )}
    </Paper>
  );
}
