"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { professorApi } from "@/services/api";
import { ProfessorListaResponse } from "@/services/domains/professor/response";
import { useQuery } from "@tanstack/react-query";

interface UseProfessoresReturn {
  professores: ProfessorListaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para gerenciar o estado da lista de professores usando React Query
 * @returns {UseProfessoresReturn} Estado da lista de professores e funções de controle
 */
export function useProfessores(): UseProfessoresReturn {
  const {
    data: professoresData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.professores.lists(),
    queryFn: async () => {
      const response = await professorApi.getListaProfessores();
      return response.content;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar a lista de professores. Tente novamente.",
    },
  });

  return {
    professores: professoresData ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar a lista de professores. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
