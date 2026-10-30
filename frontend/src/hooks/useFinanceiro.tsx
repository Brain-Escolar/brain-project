"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { financeiroApi } from "@/services/api";
import { FiltroInadimplencia } from "@/services/domains/financeiro";
import { useQuery } from "@tanstack/react-query";

/**
 * Inadimplência com aging.
 *
 * `staleTime` curto porque o relatório muda a cada baixa: a secretaria dá baixa
 * numa parcela e a lista de cobrança tem de encolher na frente dela. Quem dá
 * baixa também invalida a chave, então isto é só a rede de segurança para
 * baixa feita em outra aba ou por outra pessoa.
 */
export function useInadimplencia(filtro?: FiltroInadimplencia) {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: QUERY_KEYS.financeiro.inadimplencia(filtro),
    queryFn: () => financeiroApi.getInadimplencia(filtro),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    meta: { errorMessage: "Erro ao carregar a inadimplência." },
  });

  return {
    relatorio: data ?? null,
    loading: isLoading,
    recarregando: isFetching && !isLoading,
  };
}

/** Conferência de caixa de uma data. Estornos ficam de fora da lista. */
export function useCaixaDoDia(data?: string) {
  const { data: pagamentos, isLoading } = useQuery({
    queryKey: QUERY_KEYS.financeiro.caixa(data),
    queryFn: () => financeiroApi.getCaixaDoDia(data),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    meta: { errorMessage: "Erro ao carregar o caixa do dia." },
  });

  return { pagamentos: pagamentos ?? [], loading: isLoading };
}

/**
 * Histórico de baixas de uma parcela, estornadas inclusive.
 *
 * Inclui as estornadas de propósito: é o que explica por que a parcela voltou a
 * ficar aberta, e sem isso o estorno some da tela como se nunca tivesse
 * acontecido.
 */
export function usePagamentosDoTitulo(tituloId: number | null) {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.financeiro.pagamentosDoTitulo(tituloId ?? 0),
    queryFn: () => financeiroApi.getPagamentosDoTitulo(tituloId!),
    enabled: tituloId !== null,
    refetchOnWindowFocus: false,
    meta: { errorMessage: "Erro ao carregar as baixas desta parcela." },
  });

  return { pagamentos: data ?? [], loading: isLoading };
}
