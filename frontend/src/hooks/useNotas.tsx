"use client";
import { useQuery } from "@tanstack/react-query";
import { notaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";

/**
 * Hook para buscar todas as notas
 */
export function useNotas() {
  const {
    data: notas = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.notas.lists(),
    queryFn: async () => {
      const response = await notaApi.getListaNotas();
      return response.content || [];
    },
  });

  return {
    notas,
    loading,
    error,
    refetch,
  };
}
