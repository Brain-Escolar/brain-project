"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { secretarioApi } from "@/services/api";
import { SecretarioListaResponse } from "@/services/domains/secretario/response";
import { useQuery } from "@tanstack/react-query";

interface UseSecretariosReturn {
  secretarios: SecretarioListaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para a lista de secretários usando React Query
 */
export function useSecretarios(): UseSecretariosReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.secretarios.lists(),
    queryFn: async () => {
      const response = await secretarioApi.getListaSecretarios();
      return response.content;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    secretarios: data ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar a lista de secretários. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
  };
}
