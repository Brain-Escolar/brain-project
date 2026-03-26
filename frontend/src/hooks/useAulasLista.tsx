"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { aulaApi } from "@/services/api";
import { AulaListaResponse } from "@/services/domains/aula/response";
import { useQuery } from "@tanstack/react-query";

interface UseAulasListaReturn {
  aulas: AulaListaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para gerenciar o estado da lista de aulas usando React Query
 * @returns {UseAulasListaReturn} Estado da lista de aulas e funções de controle
 */
export function useAulasLista(): UseAulasListaReturn {
  const {
    data: aulasData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.aulas.lists(),
    queryFn: async () => {
      const response = await aulaApi.getListaAulasPaginada();
      return response.content;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar a lista de aulas. Tente novamente.",
    },
  });

  return {
    aulas: aulasData ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar a lista de aulas. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
