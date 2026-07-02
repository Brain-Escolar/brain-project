"use client";
import { useQuery } from "@tanstack/react-query";
import { informeRendimentoApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useInformesRendimento() {
  const {
    data: informesRendimento = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.informesRendimento.meus(),
    queryFn: () => informeRendimentoApi.listarMeus(),
  });

  return { informesRendimento, loading, error };
}
