"use client";
import { useQuery } from "@tanstack/react-query";
import { avaliacaoApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";

/**
 * Hook para buscar uma avaliação específica por ID
 */
export function useAvaliacao(id: string | null) {
  const {
    data: avaliacao,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.avaliacoes.detail(id || ""),
    queryFn: () => avaliacaoApi.getAvaliacaoById(id!),
    enabled: !!id,
  });

  return {
    avaliacao,
    loading,
    error,
  };
}
