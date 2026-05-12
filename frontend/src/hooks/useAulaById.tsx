"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { aulaApi } from "@/services/api";
import { AulaDetalheResponse } from "@/services/domains/aula/response";
import { useQuery } from "@tanstack/react-query";

interface UseAulaByIdReturn {
  aula: AulaDetalheResponse | null;
  loading: boolean;
  error: string | null;
}

export function useAulaById(id: string | null): UseAulaByIdReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.aulas.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      return await aulaApi.getAulaById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    aula: data ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar os dados da aula." : null,
  };
}
