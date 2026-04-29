"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { estudanteApi } from "@/services/api";
import { EstudanteAnotacaoResponse } from "@/services/domains/estudante";
import { useQuery } from "@tanstack/react-query";

interface UseAnotacoesAlunoReturn {
  anotacoes: EstudanteAnotacaoResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAnotacoesAluno(): UseAnotacoesAlunoReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.estudante.anotacoes.semana(),
    queryFn: () => estudanteApi.getAnotacoesSemana(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    anotacoes: data ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar os registros disciplinares." : null,
    refetch: () => refetch(),
  };
}
