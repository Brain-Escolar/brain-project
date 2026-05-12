"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { aulaApi } from "@/services/api";
import { AulaInfoResponse } from "@/services/domains/aula/response";
import { useQuery } from "@tanstack/react-query";

interface UseAulaDetalheReturn {
  aula: AulaInfoResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para buscar as informações de uma aula específica por ID usando React Query
 * @param id - ID da aula a ser buscada
 * @returns {UseAulaDetalheReturn} Estado da aula e funções de controle
 */
export function useAulaDetalhe(id: string | null): UseAulaDetalheReturn {
  const {
    data: aulaData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.aulas.info(id || ""),
    queryFn: async () => {
      if (!id) return null;
      const response = await aulaApi.getAulaInfo(id);
      return response;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar os dados da aula. Tente novamente.",
    },
  });

  return {
    aula: aulaData ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar os dados da aula. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
