"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { serieApi } from "@/services/api";
import { SerieListaResponse } from "@/services/domains/serie/response";
import { useQuery } from "@tanstack/react-query";

interface UseSeriesReturn {
  series: SerieListaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para gerenciar o estado da lista de séries usando React Query
 * @returns {UseSeriesReturn} Estado da lista de séries e funções de controle
 */
export function useSeries(): UseSeriesReturn {
  const {
    data: seriesData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.series.lists(),
    queryFn: async () => {
      const response = await serieApi.getListaSeriesPaginada();
      return response.content;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar a lista de séries. Tente novamente.",
    },
  });

  return {
    series: seriesData ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar a lista de séries. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
