"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { crmApi } from "@/services/api";
import { ListarProcessosCrmParams } from "@/services/domains/crm";
import { useQuery } from "@tanstack/react-query";

export function useCrmProcessos(filtros?: ListarProcessosCrmParams) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.crm.processos(filtros as Record<string, unknown>),
    queryFn: () => crmApi.getProcessos(filtros),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    meta: { errorMessage: "Erro ao carregar os processos do CRM." },
  });

  return {
    processos: data ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar os processos do CRM." : null,
    refetch,
  };
}
