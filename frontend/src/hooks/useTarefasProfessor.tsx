"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { tarefaApi } from "@/services/api";
import { TarefaResponse } from "@/services/domains/tarefa/response";
import { useQuery } from "@tanstack/react-query";

interface UseTarefasProfessorReturn {
  tarefas: TarefaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTarefasProfessor(): UseTarefasProfessorReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.tarefas.lists(), "professor"],
    queryFn: async () => {
      const response = await tarefaApi.getTarefasProfessor();
      return response.content ?? [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    tarefas: data ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar as tarefas. Tente novamente." : null,
    refetch,
  };
}
