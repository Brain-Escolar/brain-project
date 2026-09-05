"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { crmApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export function useCrmRelatorios(anoLetivo?: number) {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.crm.relatorios(anoLetivo),
    queryFn: () => crmApi.getRelatorios(anoLetivo),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    meta: { errorMessage: "Erro ao carregar os relatórios do CRM." },
  });

  return { relatorio: data, loading: isLoading };
}
