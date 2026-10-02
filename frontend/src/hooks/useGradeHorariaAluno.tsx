"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { responsavelPortalApi } from "@/services/api";
import { useAlunoSelecionado } from "@/contexts/AlunoSelecionadoContext";

/** Grade horária semanal do aluno vinculado. */
export function useGradeHorariaAluno() {
  const { alunoId } = useAlunoSelecionado();

  const {
    data: aulas = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.responsavel.gradeHoraria(alunoId ?? 0),
    queryFn: () => responsavelPortalApi.getGradeHoraria(alunoId as number),
    enabled: alunoId !== null,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    aulas,
    loading: isLoading,
    error: error ? "Erro ao carregar a grade horária." : null,
  };
}
