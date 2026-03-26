"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { fichaMedicaApi } from "@/services/api";
import { FichaMedicaResponse } from "@/services/domains/ficha-medica";
import { useQuery } from "@tanstack/react-query";

interface UseFichasMedicasReturn {
  fichasMedicas: FichaMedicaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para gerenciar o estado das fichas médicas usando React Query
 * @returns {UseFichasMedicasReturn} Estado das fichas médicas e funções de controle
 */
export function useFichasMedicas(): UseFichasMedicasReturn {
  const {
    data: fichasMedicasData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.fichasMedicas.lists(),
    queryFn: async () => {
      const response = await fichaMedicaApi.listaTodasFichasMedicas();
      return response.content;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar as fichas médicas. Tente novamente.",
    },
  });

  return {
    fichasMedicas: fichasMedicasData ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar as fichas médicas. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
