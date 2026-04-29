"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { estudanteApi } from "@/services/api";
import { EstudanteTarefaResponse } from "@/services/domains/estudante";
import { useQuery } from "@tanstack/react-query";

interface UseTarefasAlunoReturn {
  tarefas: EstudanteTarefaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTarefasAluno(): UseTarefasAlunoReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.estudante.tarefas.lists(),
    queryFn: async () => {
      const response = await estudanteApi.getTarefasAluno();
      return response.content;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    tarefas: data ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar as tarefas." : null,
    refetch: () => refetch(),
  };
}
