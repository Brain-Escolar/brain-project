"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { responsavelPortalApi } from "@/services/api";

/** Dados de sessao do responsavel, incluindo a permissao de acesso financeiro. */
export function useResponsavelLogado() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.responsavel.me(),
    queryFn: () => responsavelPortalApi.getMeusDados(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    responsavel: data ?? null,
    acessoFinanceiro: data?.acessoFinanceiro ?? false,
    loading: isLoading,
    error,
  };
}
