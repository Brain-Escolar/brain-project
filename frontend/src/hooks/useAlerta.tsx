"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { alertaApi } from "@/services/api";
import { AlertaResponse } from "@/services/domains/alerta";
import { useQuery } from "@tanstack/react-query";

interface UseAlertaReturn {
  alerta: AlertaResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para gerenciar o estado de um alerta específico usando React Query
 * @param id - ID do alerta a ser buscado
 * @returns {UseAlertaReturn} Estado do alerta e funções de controle
 */
export function useAlerta(id: string | null): UseAlertaReturn {
  const {
    data: alertaData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.alertas.detail?.(id!) ?? ["alertas", "detail", id],
    queryFn: async () => {
      if (!id) return null;
      return await alertaApi.buscarAlerta(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar o alerta. Tente novamente.",
    },
  });

  return {
    alerta: alertaData ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar o alerta. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
