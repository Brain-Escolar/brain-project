"use client";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

import PageScaffold from "@/components/pageScaffold/PageScaffold";
import Badge from "@/components/badge";
import KpiCard from "@/components/kpiCard";
import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import { useAlunoSelecionado } from "@/contexts/AlunoSelecionadoContext";
import { useFinanceiroAluno } from "@/hooks/useFinanceiroAluno";
import * as S from "./styles";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function moeda(valor: number | null | undefined): string {
  return valor == null ? "–" : BRL.format(valor);
}

function dataBR(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const [ano, mes, dia] = iso.split("-");
  if (!ano || !mes || !dia) return null;
  return `${dia}/${mes}/${ano}`;
}

export default function FinanceiroPage() {
  const { alunoAtual, isLoading: carregandoAlunos } = useAlunoSelecionado();
  const { contratos, loading, error } = useFinanceiroAluno();

  if (carregandoAlunos || loading) return <LoadingComponent />;
  if (!alunoAtual) {
    return <BrainResultNotFound message="Nenhum aluno vinculado ao seu cadastro." />;
  }

  // O backend responde 403 quando o responsável não tem a flag `financeiro`.
  // Isso não é falha: é a resposta correta para quem não é o responsável
  // financeiro do aluno.
  if (error) {
    return (
      <PageScaffold title="Financeiro">
        <BrainResultNotFound
          message="Você não tem acesso aos dados financeiros deste aluno."
          description="Apenas o responsável financeiro cadastrado na secretaria pode consultar contratos e valores."
        />
      </PageScaffold>
    );
  }

  const nomeAluno = alunoAtual.nomeSocial || alunoAtual.nome;
  const ativos = contratos.filter((c) => c.status === "ATIVO");
  const totalMensal = ativos.reduce((soma, c) => soma + (c.valorPago ?? 0), 0);

  return (
    <PageScaffold
      title="Financeiro"
      description={`Produtos e serviços contratados para ${nomeAluno}`}
    >
      <S.KpiGrid>
        <KpiCard
          rotulo="Contratos ativos"
          valor={ativos.length}
          icone={<Inventory2OutlinedIcon />}
          tone="primary"
        />
        <KpiCard
          rotulo="Total contratado"
          valor={moeda(totalMensal)}
          icone={<PaymentsOutlinedIcon />}
          tone="primary"
        />
        <KpiCard
          rotulo="Itens contratados"
          valor={contratos.length}
          icone={<ShoppingCartOutlinedIcon />}
          tone="info"
        />
      </S.KpiGrid>

      <S.SecaoTitulo>Produtos e serviços contratados</S.SecaoTitulo>

      {contratos.length === 0 ? (
        <BrainResultNotFound message="Nenhum produto ou serviço contratado para este aluno." />
      ) : (
        <S.Lista>
          {contratos.map((contrato) => {
            const cancelado = contrato.status === "CANCELADO";
            const compra = dataBR(contrato.dataCompra);
            const temDesconto = (contrato.desconto ?? 0) > 0;
            return (
              <S.Produto key={contrato.id}>
                <S.ProdutoIcone>
                  <SchoolOutlinedIcon />
                </S.ProdutoIcone>
                <S.ProdutoCorpo>
                  <S.ProdutoNome>{contrato.produtoNome}</S.ProdutoNome>
                  <S.ProdutoModalidade>{contrato.modalidade}</S.ProdutoModalidade>
                  {compra && <S.ProdutoData>Contratado em {compra}</S.ProdutoData>}
                </S.ProdutoCorpo>
                <S.ProdutoDireita>
                  <div style={{ textAlign: "right" }}>
                    <S.Valor $cancelado={cancelado}>{moeda(contrato.valorPago)}</S.Valor>
                    {temDesconto && !cancelado && (
                      <div>
                        <S.ValorOriginal>{moeda(contrato.valorOriginal)}</S.ValorOriginal>
                      </div>
                    )}
                  </div>
                  <Badge $tone={cancelado ? "neutral" : "success"}>
                    {cancelado ? "Cancelado" : "Ativo"}
                  </Badge>
                </S.ProdutoDireita>
              </S.Produto>
            );
          })}
        </S.Lista>
      )}

      {/* Boletos ainda não existem no backend — bloco marcado como módulo futuro. */}
      <S.Placeholder>
        <ReceiptLongOutlinedIcon sx={{ fontSize: 32, color: "text.disabled" }} />
        <S.PlaceholderTitulo>Boletos</S.PlaceholderTitulo>
        <S.PlaceholderTexto>
          Em breve: segunda via, linha digitável e histórico de pagamentos.
        </S.PlaceholderTexto>
      </S.Placeholder>
    </PageScaffold>
  );
}
