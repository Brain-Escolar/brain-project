"use client";

import { useQuery } from "@tanstack/react-query";
import { alunoApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { AnotacaoAlunoDisciplinaResponse } from "@/services/domains/aluno/response";

interface UseAlunoAnotacoesDisciplinaReturn {
  anotacoes: AnotacaoAlunoDisciplinaResponse[];
  loading: boolean;
  error: string | null;
}

export function useAlunoAnotacoesDisciplina(
  alunoId: string | null,
  disciplinaId: string | null,
): UseAlunoAnotacoesDisciplinaReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.alunos.anotacoesDisciplina(alunoId || "", disciplinaId || ""),
    queryFn: () => alunoApi.getAnotacoesPorDisciplina(alunoId!, disciplinaId!),
    enabled: !!alunoId && !!disciplinaId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    anotacoes: data ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar as anotações do aluno." : null,
  };
}
