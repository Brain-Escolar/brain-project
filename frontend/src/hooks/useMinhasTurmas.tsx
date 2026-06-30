"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { professorApi } from "@/services/api";
import { DisciplinaTurmasProfessorResponse } from "@/services/domains/professor/response";
import { useQuery } from "@tanstack/react-query";

interface UseMinhasTurmasReturn {
  disciplinas: DisciplinaTurmasProfessorResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
}

/**
 * Hook para buscar as turmas do professor logado, agrupadas por disciplina
 */
export function useMinhasTurmas(): UseMinhasTurmasReturn {
  const { data, isLoading, error, refetch, isSuccess } = useQuery({
    queryKey: QUERY_KEYS.professorTurmas.lists(),
    queryFn: async () => professorApi.getMinhasTurmas(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar suas turmas. Tente novamente.",
    },
  });

  return {
    disciplinas: data ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar suas turmas. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
  };
}
