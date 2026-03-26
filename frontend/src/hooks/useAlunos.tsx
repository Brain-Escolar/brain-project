"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { alunoApi } from "@/services/api";
import { AlunoListaResponse } from "@/services/domains/aluno/response";
import { useQuery } from "@tanstack/react-query";

interface UseAlunosReturn {
  alunos: AlunoListaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
}

/**
 * Hook para buscar a lista de alunos usando React Query
 * @returns {UseAlunosReturn} Estado dos alunos e funções de controle
 */
export function useAlunos(): UseAlunosReturn {
  const { data, isLoading, error, refetch, isSuccess } = useQuery({
    queryKey: QUERY_KEYS.alunos.lists(),
    queryFn: async () => {
      const response = await alunoApi.getListaAlunos();
      return response.content || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar a lista de alunos. Tente novamente.",
    },
  });

  return {
    alunos: data ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar a lista de alunos. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
  };
}
