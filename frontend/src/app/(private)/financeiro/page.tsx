"use client";

import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ReportGmailerrorredOutlinedIcon from "@mui/icons-material/ReportGmailerrorredOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

import PageScaffold from "@/components/pageScaffold/PageScaffold";
import Badge, { BadgeTone } from "@/components/badge";
import KpiCard from "@/components/kpiCard";
import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import { useCarneResponsavel } from "@/hooks/useCarneResponsavel";
import { ParcelaPortalResponse, SituacaoParcela } from "@/services/domains/responsavel-portal";
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

/** Competência é sempre dia 1, então o dia só polui: mostra mês/ano. */
function competenciaBR(iso: string | null | undefined): string {
  if (!iso) return "–";
  const [ano, mes] = iso.split("-");
  if (!ano || !mes) return "–";
  return `${mes}/${ano}`;
}

const SITUACAO: Record<SituacaoParcela, { rotulo: string; tone: BadgeTone }> = {
  PAGA: { rotulo: "Paga", tone: "success" },
  A_VENCER: { rotulo: "A vencer", tone: "neutral" },
  VENCE_HOJE: { rotulo: "Vence hoje", tone: "warning" },
  EM_ATRASO: { rotulo: "Em atraso", tone: "error" },
  CANCELADA: { rotulo: "Cancelada", tone: "neutral" },
  SUBSTITUIDA: { rotulo: "Substituída", tone: "neutral" },
  ESTORNADA: { rotulo: "Estornada", tone: "warning" },
};

const FORMAS: Record<string, string> = {
  DINHEIRO: "dinheiro",
  PIX: "Pix",
  TRANSFERENCIA: "transferência",
  CARTAO_CREDITO: "cartão de crédito",
  CARTAO_DEBITO: "cartão de débito",
  BOLETO: "boleto",
  CHEQUE: "cheque",
  OUTRO: "outra forma",
};

/**
 * O carnê da família: o que ela paga, o que já pagou e o que vem.
 *
 * Mostra bruto e desconto separados de propósito — "mensalidade 1.350, bolsa
 * −270, a pagar 1.080". Só o valor final esconderia a bolsa de quem a recebeu, e
 * bolsa que ninguém percebe não gera a gratidão que a escola esperava quando
 * decidiu concedê-la.
 *
 * Não pede aluno selecionado: os títulos são do responsável, e quem tem dois
 * filhos paga uma conta só. O nome do aluno vem em cada linha.
 */
export default function FinanceiroPage() {
  const { carne, loading, semAcesso } = useCarneResponsavel();

  if (loading) return <LoadingComponent />;

  // 403 aqui não é falha: é a resposta correta para quem não é o responsável
  // financeiro. Nem todo responsável vinculado vê valores.
  if (semAcesso || !carne) {
    return (
      <PageScaffold title="Financeiro">
        <BrainResultNotFound
          message="Você não tem acesso aos dados financeiros."
          description="Apenas o responsável financeiro cadastrado na secretaria pode consultar parcelas e valores."
        />
      </PageScaffold>
    );
  }

  const proximo = dataBR(carne.proximoVencimento);

  return (
    <PageScaffold
      title="Financeiro"
      description={
        proximo
          ? `Próxima parcela em ${proximo}: ${moeda(carne.valorDoProximoVencimento)}`
          : "Suas parcelas do ano letivo"
      }
    >
      <S.KpiGrid>
        <KpiCard
          rotulo="Ainda a pagar"
          valor={moeda(carne.totalAberto)}
          icone={<PaymentsOutlinedIcon />}
          tone="primary"
        />
        <KpiCard
          rotulo="Já pago"
          valor={moeda(carne.totalPago)}
          icone={<CheckCircleOutlineIcon />}
          tone="success"
        />
        <KpiCard
          rotulo={carne.parcelasEmAtraso === 1 ? "1 parcela em atraso" : `${carne.parcelasEmAtraso} parcelas em atraso`}
          valor={moeda(carne.totalEmAtraso)}
          icone={<ReportGmailerrorredOutlinedIcon />}
          tone={carne.totalEmAtraso > 0 ? "error" : "neutral"}
        />
        <KpiCard
          rotulo="Desconto de bolsa no ano"
          valor={moeda(carne.totalDeBolsa)}
          icone={<SchoolOutlinedIcon />}
          tone="info"
        />
      </S.KpiGrid>

      <S.SecaoTitulo>Parcelas</S.SecaoTitulo>

      {carne.parcelas.length === 0 ? (
        <BrainResultNotFound
          message="Nenhuma parcela encontrada."
          description="As parcelas aparecem aqui depois que a matrícula é efetivada na secretaria."
        />
      ) : (
        <S.Lista>
          {carne.parcelas.map((p) => (
            <LinhaDaParcela key={p.id} parcela={p} />
          ))}
        </S.Lista>
      )}

      {/* Boleto e Pix entram na próxima fase; hoje o pagamento é combinado na secretaria. */}
      <S.Placeholder>
        <ReceiptLongOutlinedIcon sx={{ fontSize: 32, color: "text.disabled" }} />
        <S.PlaceholderTitulo>Boleto e Pix</S.PlaceholderTitulo>
        <S.PlaceholderTexto>
          Em breve: segunda via com linha digitável e QR Code. Por enquanto, o pagamento é
          combinado com a secretaria, e a baixa aparece aqui assim que registrada.
        </S.PlaceholderTexto>
      </S.Placeholder>
    </PageScaffold>
  );
}

function LinhaDaParcela({ parcela }: { parcela: ParcelaPortalResponse }) {
  const situacao = SITUACAO[parcela.situacao];
  const temBolsa = parcela.valorDesconto > 0;
  const naoVale =
    parcela.situacao === "CANCELADA" ||
    parcela.situacao === "SUBSTITUIDA" ||
    parcela.situacao === "ESTORNADA";

  const paga = dataBR(parcela.pagaEm);
  const vence = dataBR(parcela.vencimento);

  return (
    <S.Produto>
      <S.ProdutoIcone>
        <ReceiptLongOutlinedIcon />
      </S.ProdutoIcone>

      <S.ProdutoCorpo>
        <S.ProdutoNome>
          Parcela {parcela.numeroParcela}/{parcela.totalParcelas} ·{" "}
          {competenciaBR(parcela.competencia)}
        </S.ProdutoNome>

        <S.ProdutoModalidade>
          {parcela.alunoNome ?? "Aluno"} · {parcela.contratoNumero}
        </S.ProdutoModalidade>

        <S.ProdutoData>
          {paga
            ? `Paga em ${paga}${
                parcela.formaPagamento ? ` por ${FORMAS[parcela.formaPagamento] ?? "outra forma"}` : ""
              }`
            : parcela.situacao === "EM_ATRASO"
              ? `Venceu em ${vence} · ${parcela.diasDeAtraso} dia(s) de atraso`
              : `Vence em ${vence}`}
        </S.ProdutoData>
      </S.ProdutoCorpo>

      <S.ProdutoDireita>
        <div style={{ textAlign: "right" }}>
          <S.Valor $cancelado={naoVale}>{moeda(parcela.valorLiquido)}</S.Valor>
          {temBolsa && !naoVale && (
            <div>
              {/* O valor cheio riscado ao lado é o que torna a bolsa visível. */}
              <S.ValorOriginal>{moeda(parcela.valorBruto)}</S.ValorOriginal>
            </div>
          )}
        </div>
        <Badge $tone={situacao.tone}>{situacao.rotulo}</Badge>
      </S.ProdutoDireita>
    </S.Produto>
  );
}
