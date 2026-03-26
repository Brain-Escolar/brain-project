"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { tarefaApi } from "@/services/api";
import { TarefaResponse } from "@/services/domains/tarefa";
import { useQuery } from "@tanstack/react-query";

interface UseTarefaReturn {
  tarefa: TarefaResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para gerenciar o estado de uma tarefa específica usando React Query
 * @param id - ID da tarefa a ser buscada
 * @returns {UseTarefaReturn} Estado da tarefa e funções de controle
 */
export function useTarefa(id: string | null): UseTarefaReturn {
  const {
    data: tarefaData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.tarefas.detail?.(id!) ?? ["tarefas", "detail", id],
    queryFn: async () => {
      if (!id) return null;
      return await tarefaApi.buscarTarefa(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar a tarefa. Tente novamente.",
    },
  });

  return {
    tarefa: tarefaData ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar a tarefa. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
