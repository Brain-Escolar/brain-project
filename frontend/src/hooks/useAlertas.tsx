"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { alertaApi } from "@/services/api";
import { AlertaResponse } from "@/services/domains/alerta";
import { useQuery } from "@tanstack/react-query";

interface UseAlertasReturn {
  alertas: AlertaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para gerenciar o estado dos alertas usando React Query
 * @returns {UseAlertasReturn} Estado dos alertas e funções de controle
 */
export function useAlertas(): UseAlertasReturn {
  const {
    data: alertasData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.alertas.lists(),
    queryFn: async () => {
      const response = await alertaApi.listaTodasAlertas();
      return response.content;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar os alertas. Tente novamente.",
    },
  });

  return {
    alertas: alertasData ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar os alertas. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
