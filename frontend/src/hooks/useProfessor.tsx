"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { professorApi } from "@/services/api";
import { ProfessorDetalheResponse } from "@/services/domains/professor/response";
import { useQuery } from "@tanstack/react-query";

interface UseProfessorReturn {
  professor: ProfessorDetalheResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para buscar um professor específico por ID usando React Query
 * @param id - ID do professor a ser buscado
 * @returns {UseProfessorReturn} Estado do professor e funções de controle
 */
export function useProfessor(id: string | null): UseProfessorReturn {
  const {
    data: professorData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.professores.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      const response = await professorApi.getProfessorById(id);
      return response;
    },
    enabled: !!id, // Só executa a query se o ID existir
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar os dados do professor. Tente novamente.",
    },
  });

  return {
    professor: professorData ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar os dados do professor. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
