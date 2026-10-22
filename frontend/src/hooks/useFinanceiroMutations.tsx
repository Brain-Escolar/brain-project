"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { financeiroApi } from "@/services/api";
import { BaixaRequest, EstornoRequest } from "@/services/domains/financeiro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "react-toastify";

/**
 * O backend recusa a baixa com mensagem dizendo O QUE barrou: parcela já paga,
 * data no futuro, valor abaixo do líquido. Essa é a parte útil do erro — "baixa
 * parcial não é possível, para receber menos renegocie a parcela" diz ao
 * funcionário o que fazer, enquanto um toast genérico o deixaria clicando de
 * novo.
 */
function mensagemDoBackend(erro: unknown, fallback: string): string {
  const resposta = (erro as AxiosError<{ message?: string; erro?: string }>)?.response?.data;
  return resposta?.message ?? resposta?.erro ?? fallback;
}

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function useFinanceiroMutations() {
  const queryClient = useQueryClient();

  /**
   * Baixa muda o contas a receber inteiro: a parcela sai da inadimplência, entra
   * no caixa do dia e o carnê do contrato muda de status. Invalida os três.
   */
  function invalidarDependentes() {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.financeiro.all });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contratos.all });
  }

  const baixar = useMutation({
    mutationFn: ({ tituloId, dados }: { tituloId: number; dados: BaixaRequest }) =>
      financeiroApi.baixar(tituloId, dados),
    onSuccess: (resultado) => {
      invalidarDependentes();
      toast.success(
        `Baixa registrada: parcela ${resultado.titulo.numeroParcela}, ` +
          `${BRL.format(resultado.pagamento.valorPago)}.`,
      );
    },
    onError: (erro) => {
      toast.error(mensagemDoBackend(erro, "Não foi possível dar baixa nesta parcela."));
    },
  });

  const estornar = useMutation({
    mutationFn: ({ pagamentoId, dados }: { pagamentoId: number; dados: EstornoRequest }) =>
      financeiroApi.estornar(pagamentoId, dados),
    onSuccess: (resultado) => {
      invalidarDependentes();

      /**
       * Estorno SEM reemissão tira a parcela do contas a receber de vez. É caso
       * legítimo — baixa lançada no aluno errado — mas é o tipo de coisa que
       * ninguém lembra de ter feito três meses depois, quando falta dinheiro.
       * Então avisa com aviso, não com sucesso.
       */
      if (!resultado.tituloReemitido) {
        toast.warning(
          "Baixa estornada SEM reemissão: esta parcela saiu do contas a receber e não será mais cobrada.",
        );
        return;
      }

      toast.success(
        `Baixa estornada e parcela reemitida para ${resultado.tituloReemitido.vencimento
          .split("-")
          .reverse()
          .join("/")}.`,
      );
    },
    onError: (erro) => {
      toast.error(mensagemDoBackend(erro, "Não foi possível estornar esta baixa."));
    },
  });

  return { baixar, estornar };
}
