"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { alunoApi } from "@/services/api";
import { FichaMedicaAlunoResponse } from "@/services/domains/aluno/response";
import { useQuery } from "@tanstack/react-query";

interface UseAlunoFichaMedicaReturn {
  fichaMedica: FichaMedicaAlunoResponse | null;
  loading: boolean;
  error: string | null;
}

export function useAlunoFichaMedica(alunoId: string | null, enabled = true): UseAlunoFichaMedicaReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.alunos.fichaMedica(alunoId || ""),
    queryFn: () => alunoApi.getFichaMedicaByAluno(alunoId!),
    enabled: !!alunoId && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    fichaMedica: data ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar a ficha médica." : null,
  };
}
