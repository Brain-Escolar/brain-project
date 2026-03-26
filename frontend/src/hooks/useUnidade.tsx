"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { unidadeApi } from "@/services/api";
import { UnidadeResponse } from "@/services/domains/unidade/response";
import { useQuery } from "@tanstack/react-query";

interface UseUnidadeReturn {
  unidade: UnidadeResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para buscar uma unidade específica por ID usando React Query
 * @param id - ID da unidade a ser buscada
 * @returns {UseUnidadeReturn} Estado da unidade e funções de controle
 */
export function useUnidade(id: string | null): UseUnidadeReturn {
  const {
    data: unidadeData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.unidades.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      const response = await unidadeApi.getUnidadeById(id);
      return response;
    },
    enabled: !!id, // Só executa a query se o ID existir
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar os dados da unidade. Tente novamente.",
    },
  });

  return {
    unidade: unidadeData ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar os dados da unidade. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
