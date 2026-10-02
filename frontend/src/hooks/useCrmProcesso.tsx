"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { crmApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export function useCrmProcesso(id: string | number) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.crm.processo(id),
    queryFn: () => crmApi.getProcesso(id),
    enabled: !!id,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    meta: { errorMessage: "Erro ao carregar o processo." },
  });

  return {
    processo: data,
    loading: isLoading,
    error: error ? "Erro ao carregar o processo." : null,
    refetch,
  };
}
