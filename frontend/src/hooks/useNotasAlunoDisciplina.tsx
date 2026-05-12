"use client";

import { useQuery } from "@tanstack/react-query";
import { notaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { NotasAlunoDisciplinaResponse } from "@/services/domains/notas/response";

interface UseNotasAlunoDisciplinaReturn {
  notasAluno: NotasAlunoDisciplinaResponse | null;
  loading: boolean;
  error: string | null;
}

export function useNotasAlunoDisciplina(
  alunoId: string | null,
  disciplinaId: string | null,
): UseNotasAlunoDisciplinaReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.notas.porAlunoDisciplina(alunoId || "", disciplinaId || ""),
    queryFn: () => notaApi.getNotasPorAlunoDisciplina(alunoId!, disciplinaId!),
    enabled: !!alunoId && !!disciplinaId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    notasAluno: data ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar as notas do aluno." : null,
  };
}
