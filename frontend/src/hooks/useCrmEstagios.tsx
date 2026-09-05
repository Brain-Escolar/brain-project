"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { crmApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export function useCrmEstagios() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.crm.estagios(),
    queryFn: () => crmApi.getEstagios(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    meta: { errorMessage: "Erro ao carregar os estágios do funil." },
  });

  return { estagios: data ?? [], loading: isLoading };
}

export function useCrmOrigens() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.crm.origens(),
    queryFn: () => crmApi.getOrigens(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    meta: { errorMessage: "Erro ao carregar as origens de lead." },
  });

  return { origens: data ?? [], loading: isLoading };
}
