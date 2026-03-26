"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { tarefaApi } from "@/services/api";
import { TarefaResponse } from "@/services/domains/tarefa";
import { useQuery } from "@tanstack/react-query";

interface UseTarefasReturn {
  tarefas: TarefaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para gerenciar o estado das tarefas usando React Query
 * @returns {UseTarefasReturn} Estado das tarefas e funções de controle
 */
export function useTarefas(): UseTarefasReturn {
  const {
    data: tarefasData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.tarefas.lists(),
    queryFn: async () => {
      const response = await tarefaApi.listaTodasTarefas();
      return response.content;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar as tarefas. Tente novamente.",
    },
  });

  return {
    tarefas: tarefasData ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar as tarefas. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
