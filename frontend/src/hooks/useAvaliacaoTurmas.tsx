"use client";
import { useQuery } from "@tanstack/react-query";
import { avaliacaoApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";

/**
 * Hook para buscar as turmas vinculadas a uma avaliação
 */
export function useAvaliacaoTurmas(avaliacaoId: string | null) {
  const {
    data: turmas = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.avaliacaoTurmas.porAvaliacao(avaliacaoId || ""),
    queryFn: () => avaliacaoApi.listarTurmasDaAvaliacao(avaliacaoId!),
    enabled: !!avaliacaoId,
  });

  return {
    turmas,
    loading,
    error,
  };
}
