"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { professorApi } from "@/services/api";
import { DetalheTurmaProfessorResponse } from "@/services/domains/professor/response";
import { useQuery } from "@tanstack/react-query";

interface UseTurmaProfessorDetalheReturn {
  turma: DetalheTurmaProfessorResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
}

/**
 * Hook para buscar o resumo dos alunos de uma turma+disciplina do professor logado
 */
export function useTurmaProfessorDetalhe(
  turmaId: string | null,
  disciplinaId: string | null,
): UseTurmaProfessorDetalheReturn {
  const { data, isLoading, error, refetch, isSuccess } = useQuery({
    queryKey: QUERY_KEYS.professorTurmas.detail(turmaId || "", disciplinaId || ""),
    queryFn: async () => {
      if (!turmaId || !disciplinaId) return null;
      return professorApi.getTurmaAlunos(turmaId, disciplinaId);
    },
    enabled: !!turmaId && !!disciplinaId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar os alunos da turma. Tente novamente.",
    },
  });

  return {
    turma: data ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar os alunos da turma. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
  };
}
