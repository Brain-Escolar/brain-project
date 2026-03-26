"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { aulaApi } from "@/services/api";
import { AulaDetalheResponse } from "@/services/domains/aula/response";
import { useQuery } from "@tanstack/react-query";

interface UseAulaDetalheReturn {
  aula: AulaDetalheResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para buscar uma aula específica por ID usando React Query
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
    queryKey: QUERY_KEYS.aulas.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      const response = await aulaApi.getAulaById(id);
      return response;
    },
    enabled: !!id, // Só executa a query se o ID existir
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
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
