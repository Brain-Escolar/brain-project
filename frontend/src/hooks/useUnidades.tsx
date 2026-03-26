"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { unidadeApi } from "@/services/api";
import { UnidadeResponse } from "@/services/domains/unidade/response";
import { useQuery } from "@tanstack/react-query";

interface UseUnidadesReturn {
  unidades: UnidadeResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
}

/**
 * Hook para buscar lista de unidades
 */
export function useUnidades(): UseUnidadesReturn {
  const { data, isLoading, error, refetch, isSuccess } = useQuery({
    queryKey: QUERY_KEYS.unidades.lists(),
    queryFn: async () => {
      const response = await unidadeApi.getListaUnidades();
      return response.content;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar a lista de unidades. Tente novamente.",
    },
  });

  return {
    unidades: data ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar a lista de unidades. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
  };
}
