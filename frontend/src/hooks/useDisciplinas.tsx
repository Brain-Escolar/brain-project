"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { disciplinaApi } from "@/services/api";
import { DisciplinaListaResponse } from "@/services/domains/disciplina/response";
import { useQuery } from "@tanstack/react-query";

interface UseDisciplinasReturn {
  disciplinas: DisciplinaListaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para gerenciar o estado da lista de disciplinas usando React Query
 * @returns {UseDisciplinasReturn} Estado da lista de disciplinas e funções de controle
 */
export function useDisciplinas(): UseDisciplinasReturn {
  const {
    data: disciplinasData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.disciplinas.lists(),
    queryFn: async () => {
      const response = await disciplinaApi.getListaDisciplinas();
      return response.content;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar a lista de disciplinas. Tente novamente.",
    },
  });

  return {
    disciplinas: disciplinasData ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar a lista de disciplinas. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
