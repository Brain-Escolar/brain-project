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
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { useProduto, useProdutos, usePrecos } from "@/hooks/useCatalogo";
import { useCatalogoMutations } from "@/hooks/useCatalogoMutations";
import { ModalidadeResponse, NaturezaProduto, ProdutoResponse } from "@/services/domains/produto";
import DialogNovoPreco from "./_components/DialogNovoPreco";
import DialogNovoProduto from "./_components/DialogNovoProduto";

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

const NATUREZA: Record<NaturezaProduto, { rotulo: string; cor: "primary" | "info" | "default" }> = {
  RECORRENTE: { rotulo: "Mensal", cor: "primary" },
  UNICO: { rotulo: "Uma vez no ano", cor: "info" },
  EVENTUAL: { rotulo: "Avulso", cor: "default" },
};

/**
 * O catalogo: produtos, modalidades e a tabela de precos.
 *
 * E o comeco da cadeia inteira. Sem produto com natureza definida e sem preco
 * vigente nao ha proposta; sem proposta nao ha contrato; sem contrato nao ha
 * carne, baixa nem inadimplencia. Ate esta tela, isso so existia por SQL escrito
 * na mao -- e a efetivacao da matricula recusa produto sem natureza, entao a
 * escola travava sem saber por que.
 */
export default function CatalogoPage() {
  const { produtos, loading } = useProdutos();
  const [produtoId, setProdutoId] = useState<number | null>(null);
  const [novoProduto, setNovoProduto] = useState(false);

  return (
    <PageScaffold
      title="Catálogo e preços"
      description="Produtos, modalidades e a tabela de preços por série, turno, unidade e vigência."
      actions={
        <Button variant="contained" onClick={() => setNovoProduto(true)}>
          Novo produto
        </Button>
      }
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <Paper variant="outlined" sx={{ p: 1 }}>
          {loading ? (
            <Skeleton variant="rounded" height={280} />
          ) : produtos.length === 0 ? (
            <Alert severity="info" sx={{ m: 1 }}>
              Nenhum produto cadastrado. É por aqui que a cobrança começa.
            </Alert>
          ) : (
            <List dense disablePadding>
              {produtos.map((p) => (
                <LinhaDoProduto
                  key={p.id}
                  produto={p}
                  selecionado={p.id === produtoId}
                  onClick={() => setProdutoId(p.id)}
                />
              ))}
            </List>
          )}
        </Paper>

        {produtoId === null ? (
          <Alert severity="info">
            Escolha um produto para ver as modalidades e os preços.
          </Alert>
        ) : (
          <DetalheDoProduto produtoId={produtoId} />
        )}
      </Box>

      <DialogNovoProduto aberto={novoProduto} onClose={() => setNovoProduto(false)} />
    </PageScaffold>
  );
}

function LinhaDoProduto({
  produto,
  selecionado,
  onClick,
}: {
  produto: ProdutoResponse;
  selecionado: boolean;
  onClick: () => void;
}) {
  const natureza = produto.natureza ? NATUREZA[produto.natureza] : null;

  return (
    <ListItemButton selected={selecionado} onClick={onClick}>
      <ListItemText
        primary={produto.nome}
        secondary={
          <Stack direction="row" spacing={0.5} component="span" sx={{ mt: 0.5 }}>
            {natureza ? (
              <Chip size="small" label={natureza.rotulo} color={natureza.cor} />
            ) : (
              // Produto sem natureza faz a efetivacao recusar. Marcar aqui e o
              // que transforma "nao consigo matricular" em algo acionavel.
              <Chip size="small" color="error" label="sem natureza" />
            )}
            {produto.permiteBolsa && <Chip size="small" variant="outlined" label="bolsa" />}
            {!produto.ativo && <Chip size="small" label="inativo" />}
          </Stack>
        }
        secondaryTypographyProps={{ component: "div" }}
      />
    </ListItemButton>
  );
}

function DetalheDoProduto({ produtoId }: { produtoId: number }) {
  const { produto, loading } = useProduto(produtoId);
  const { criarModalidade } = useCatalogoMutations();
  const [nomeModalidade, setNomeModalidade] = useState("");

  if (loading) return <Skeleton variant="rounded" height={320} />;
  if (!produto) return <Alert severity="warning">Produto não encontrado.</Alert>;

  return (
    <Stack spacing={2.5}>
      {!produto.natureza && (
        <Alert severity="error">
          Este produto não tem natureza definida, e a efetivação da matrícula recusa contratos que
          o incluam. Defina como ele é cobrado para liberar a matrícula.
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Typography variant="h6" fontWeight={600}>
          {produto.nome}
        </Typography>
        {produto.descricao && (
          <Typography variant="body2" color="text.secondary">
            {produto.descricao}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          Modalidades
        </Typography>
        <Typography variant="caption" color="text.secondary">
          A variante vendável do produto — Integral, Meio período, Bilíngue. O preço fica na
          modalidade, não no produto.
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <TextField
            size="small"
            label="Nova modalidade"
            value={nomeModalidade}
            onChange={(e) => setNomeModalidade(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button
            variant="outlined"
            disabled={nomeModalidade.trim().length < 2 || criarModalidade.isPending}
            onClick={() =>
              criarModalidade.mutate(
                { produtoId, dados: { modalidade: nomeModalidade.trim() } },
                { onSuccess: () => setNomeModalidade("") },
              )
            }
          >
            Adicionar
          </Button>
        </Stack>
      </Paper>

      {produto.modalidades.length === 0 ? (
        <Alert severity="info">
          Sem modalidade não há onde pendurar o preço. Crie ao menos uma — se o produto não tem
          variação, uma chamada &quot;Padrão&quot; resolve.
        </Alert>
      ) : (
        produto.modalidades.map((m) => <PrecosDaModalidade key={m.id} modalidade={m} />)
      )}
    </Stack>
  );
}

function PrecosDaModalidade({ modalidade }: { modalidade: ModalidadeResponse }) {
  const { precos, loading } = usePrecos(modalidade.id);
  const { encerrarPreco, excluirPreco } = useCatalogoMutations();
  const [novoPreco, setNovoPreco] = useState(false);

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {modalidade.modalidade}
        </Typography>
        {!modalidade.ativo && <Chip size="small" label="inativa" />}
        <Box sx={{ flex: 1 }} />
        <Button size="small" variant="contained" onClick={() => setNovoPreco(true)}>
          Novo preço
        </Button>
      </Stack>

      {loading ? (
        <Skeleton variant="rounded" height={120} />
      ) : precos.length === 0 ? (
        <Alert severity="warning">
          Sem preço cadastrado, esta modalidade não entra em nenhuma proposta.
        </Alert>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Escopo</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell>Vigência</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {precos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {p.anoLetivo && <Chip size="small" label={p.anoLetivo} />}
                      {p.unidadeNome && <Chip size="small" label={p.unidadeNome} />}
                      {p.serieNome && <Chip size="small" label={p.serieNome} />}
                      {p.turno && (
                        <Chip size="small" label={p.turno.charAt(0) + p.turno.slice(1).toLowerCase()} />
                      )}
                      {p.especificidade === 0 && !p.anoLetivo && (
                        <Chip size="small" variant="outlined" label="geral" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">{moeda(p.valor)}</TableCell>
                  <TableCell>
                    {dataBR(p.vigenciaInicio)}
                    {p.vigenciaFim ? ` a ${dataBR(p.vigenciaFim)}` : " — sem fim"}
                    {/*
                      "vigente" exige APROVADO, nao so data. Preco pendente com
                      vigencia ja comecada nao cobra ninguem: as consultas da
                      proposta so devolvem aprovado. Mostrar "vigente" aqui faria
                      quem cadastrou achar que o reajuste entrou.
                    */}
                    {p.status === "APROVADO" && p.vigenteHoje && (
                      <Chip size="small" color="success" label="vigente" sx={{ ml: 1 }} />
                    )}
                    {p.status === "PENDENTE_APROVACAO" && (
                      <Chip
                        size="small"
                        color="warning"
                        label="esperando aprovação"
                        sx={{ ml: 1 }}
                      />
                    )}
                    {p.status === "REJEITADO" && (
                      <Chip
                        size="small"
                        variant="outlined"
                        color="error"
                        label="recusado"
                        sx={{ ml: 1 }}
                        title={p.motivoDecisao ?? undefined}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {p.status === "PENDENTE_APROVACAO" || p.vigenciaInicio > hoje ? (
                      // Pendente nunca precificou nada -- e um pedido, nao um
                      // preco -- e preco futuro ainda nao precificou. Os dois
                      // podem sumir; o que ja vigorou, nao: ele explica contrato
                      // assinado, e so pode ser encerrado.
                      <Button
                        size="small"
                        color="error"
                        disabled={excluirPreco.isPending}
                        onClick={() => excluirPreco.mutate(p.id)}
                      >
                        Excluir
                      </Button>
                    ) : (
                      !p.vigenciaFim && (
                        <Button
                          size="small"
                          disabled={encerrarPreco.isPending}
                          onClick={() => encerrarPreco.mutate({ precoId: p.id, dataFim: hoje })}
                        >
                          Encerrar hoje
                        </Button>
                      )
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      <DialogNovoPreco
        modalidadeId={novoPreco ? modalidade.id : null}
        modalidadeNome={modalidade.modalidade}
        onClose={() => setNovoPreco(false)}
      />
    </Paper>
  );
}
