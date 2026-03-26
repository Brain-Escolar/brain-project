"use client";
import { useQuery } from "@tanstack/react-query";
import { avaliacaoApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";

/**
 * Hook para buscar todas as avaliações
 */
export function useAvaliacoes() {
  const {
    data: avaliacoes = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.avaliacoes.lists(),
    queryFn: async () => {
      const response = await avaliacaoApi.getListaAvaliacoes();
      return response.content || [];
    },
  });

  return {
    avaliacoes,
    loading,
    error,
    refetch,
  };
}
