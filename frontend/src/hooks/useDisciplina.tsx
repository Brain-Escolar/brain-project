"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { disciplinaApi } from "@/services/api";
import { DisciplinaDetalheResponse } from "@/services/domains/disciplina/response";
import { useQuery } from "@tanstack/react-query";

interface UseDisciplinaReturn {
  disciplina: DisciplinaDetalheResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para buscar uma disciplina específica por ID usando React Query
 * @param id - ID da disciplina a ser buscada
 * @returns {UseDisciplinaReturn} Estado da disciplina e funções de controle
 */
export function useDisciplina(id: string | null): UseDisciplinaReturn {
  const {
    data: disciplinaData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.disciplinas.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      const response = await disciplinaApi.getDisciplinaById(id);
      return response;
    },
    enabled: !!id, // Só executa a query se o ID existir
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar os dados da disciplina. Tente novamente.",
    },
  });

  return {
    disciplina: disciplinaData ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar os dados da disciplina. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
