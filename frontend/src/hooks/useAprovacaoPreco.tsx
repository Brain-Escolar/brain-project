"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { produtoApi } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

/**
 * A fila de quem aprova preço.
 *
 * Reajuste não entra em vigor sozinho: o pedido nasce PENDENTE e as consultas
 * que a proposta usa só devolvem preço APROVADO. Então um pedido esquecido aqui
 * não cobra ninguém errado — ele simplesmente não cobra, e o preço antigo
 * continua valendo.
 */
export function usePrecosPendentes() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.produtos.precosPendentes(),
    queryFn: () => produtoApi.getPrecosPendentes(),
    refetchOnWindowFocus: false,
    meta: { errorMessage: "Erro ao carregar os preços pendentes." },
  });

  return { pendentes: data ?? [], loading: isLoading };
}

export function useAprovacaoPrecoMutations() {
  const queryClient = useQueryClient();

  /** Preço aprovado muda o catálogo e a próxima proposta: invalida os dois. */
  function invalidar() {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.produtos.all });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.simulacoes.all });
  }

  const aprovar = useMutation({
    mutationFn: ({ precoId, motivo }: { precoId: number; motivo?: string }) =>
      produtoApi.aprovarPreco(precoId, motivo),
    onSuccess: (preco) => {
      toast.success(
        `Preço de ${preco.valor} aprovado. Vale a partir de ${preco.vigenciaInicio}.`,
      );
      invalidar();
    },
  });

  const rejeitar = useMutation({
    mutationFn: ({ precoId, motivo }: { precoId: number; motivo: string }) =>
      produtoApi.rejeitarPreco(precoId, motivo),
    onSuccess: () => {
      toast.info("Reajuste recusado. O preço atual continua valendo.");
      invalidar();
    },
  });

  return { aprovar, rejeitar };
}
