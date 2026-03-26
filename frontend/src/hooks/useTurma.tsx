"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { turmaApi } from "@/services/api";
import { TurmaDetalheResponse } from "@/services/domains/turma/response";
import { useQuery } from "@tanstack/react-query";

interface UseTurmaReturn {
  turma: TurmaDetalheResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para buscar uma turma específica por ID usando React Query
 * @param id - ID da turma a ser buscada
 * @returns {UseTurmaReturn} Estado da turma e funções de controle
 */
export function useTurma(id: string | null): UseTurmaReturn {
  const {
    data: turmaData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.turmas.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      const response = await turmaApi.getTurmaById(id);
      return response;
    },
    enabled: !!id, // Só executa a query se o ID existir
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar os dados da turma. Tente novamente.",
    },
  });

  return {
    turma: turmaData ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar os dados da turma. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
