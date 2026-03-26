"use client";
import { useQuery } from "@tanstack/react-query";
import { notaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";

/**
 * Hook para buscar uma nota específica por ID
 */
export function useNota(id: string | null) {
  const {
    data: nota,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.notas.detail(id || ""),
    queryFn: () => notaApi.getNotaById(id!),
    enabled: !!id,
  });

  return {
    nota,
    loading,
    error,
  };
}
