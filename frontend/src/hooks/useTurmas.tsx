"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { turmaApi } from "@/services/api";
import { TurmaListaResponse } from "@/services/domains/turma/response";
import { useQuery } from "@tanstack/react-query";

interface UseTurmasReturn {
  turmas: TurmaListaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para gerenciar o estado da lista de turmas usando React Query
 * @returns {UseTurmasReturn} Estado da lista de turmas e funções de controle
 */
export function useTurmas(): UseTurmasReturn {
  const {
    data: turmasData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.turmas.lists(),
    queryFn: async () => {
      const response = await turmaApi.getListaTurmasPaginada();
      return response.content;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar a lista de turmas. Tente novamente.",
    },
  });

  return {
    turmas: turmasData ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar a lista de turmas. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
