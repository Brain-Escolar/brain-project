"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { professorApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";

interface DisciplinaSimples {
  id: number;
  nome: string;
}

interface UseProfessorDisciplinasReturn {
  disciplinas: DisciplinaSimples[];
  loading: boolean;
  error: string | null;
}

export function useProfessorDisciplinas(): UseProfessorDisciplinasReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: [...QUERY_KEYS.aulas.all, "semana"],
    queryFn: () => professorApi.getAulasSemanalProfessor(),
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const disciplinas = useMemo(() => {
    if (!data) return [];
    const seen = new Set<number>();
    return data
      .filter((aula) => {
        if (seen.has(aula.disciplinaId)) return false;
        seen.add(aula.disciplinaId);
        return true;
      })
      .map((aula) => ({ id: aula.disciplinaId, nome: aula.disciplina }));
  }, [data]);

  return {
    disciplinas,
    loading: isLoading,
    error: error ? "Erro ao carregar disciplinas do professor." : null,
  };
}
