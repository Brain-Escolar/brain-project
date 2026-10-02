"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { crmApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export function useCrmEquipe() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: QUERY_KEYS.crm.equipe(),
    queryFn: () => crmApi.getEquipe(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    meta: { errorMessage: "Erro ao carregar a carga da equipe." },
  });

  return { equipe: data ?? [], loading: isLoading, refetch };
}
