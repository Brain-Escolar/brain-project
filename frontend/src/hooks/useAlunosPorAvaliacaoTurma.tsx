"use client";
import { useQuery } from "@tanstack/react-query";
import { avaliacaoApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";

/**
 * Hook para buscar os alunos matriculados na turma de uma avaliação (pra lançar notas)
 */
export function useAlunosPorAvaliacaoTurma(avaliacaoTurmaId: number | null) {
  const {
    data: alunos = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.avaliacaoTurmas.alunos(avaliacaoTurmaId || ""),
    queryFn: () => avaliacaoApi.getAlunosPorAvaliacaoTurma(avaliacaoTurmaId!),
    enabled: !!avaliacaoTurmaId,
  });

  return {
    alunos,
    loading,
    error,
  };
}
