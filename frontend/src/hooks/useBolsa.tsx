"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { bolsaApi } from "@/services/api";
import { TetoBolsaParams } from "@/services/domains/bolsa";
import { useQuery } from "@tanstack/react-query";

export function useTiposBolsa() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.bolsa.tipos(),
    queryFn: () => bolsaApi.getTipos(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    meta: { errorMessage: "Erro ao carregar os tipos de bolsa." },
  });

  return { tipos: data ?? [], loading: isLoading };
}

/**
 * Quanto de bolsa pode ser concedido a este aluno.
 *
 * `params` nulo desliga a consulta: enquanto o funcionário não escolheu o tipo de
 * bolsa, ou enquanto o cadastro do aluno não tem série e unidade, não há o que
 * calcular — e chamar o endpoint sem isso só produziria erro na tela.
 *
 * staleTime zero de propósito. O teto depende do saldo do envelope, que outra
 * secretária pode estar consumindo neste instante: um número em cache aqui é um
 * número que pode já não caber.
 */
export function useBolsaTeto(params: TetoBolsaParams | null) {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: QUERY_KEYS.bolsa.teto(params ?? undefined),
    queryFn: () => bolsaApi.getTeto(params!),
    enabled: params !== null,
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
    meta: { errorMessage: "Não foi possível calcular o teto de bolsa." },
  });

  return { teto: data ?? null, loading: isLoading, recalculando: isFetching, error };
}

export function useConcessoesDaSimulacao(simulacaoId: number | null) {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.bolsa.concessoes(simulacaoId ?? 0),
    queryFn: () => bolsaApi.getConcessoesDaSimulacao(simulacaoId!),
    enabled: simulacaoId !== null,
    refetchOnWindowFocus: false,
    meta: { errorMessage: "Erro ao carregar as bolsas desta proposta." },
  });

  return { concessoes: data ?? [], loading: isLoading };
}
