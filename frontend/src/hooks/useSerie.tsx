"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { serieApi } from "@/services/api";
import { SerieDetalheResponse } from "@/services/domains/serie/response";
import { useQuery } from "@tanstack/react-query";

interface UseSerieReturn {
  serie: SerieDetalheResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para buscar uma série específica por ID usando React Query
 * @param id - ID da série a ser buscada
 * @returns {UseSerieReturn} Estado da série e funções de controle
 */
export function useSerie(id: string | null): UseSerieReturn {
  const {
    data: serieData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.series.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      const response = await serieApi.getSerieById(id);
      return response;
    },
    enabled: !!id, // Só executa a query se o ID existir
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar os dados da série. Tente novamente.",
    },
  });

  return {
    serie: serieData ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar os dados da série. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
