"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { fichaMedicaApi } from "@/services/api";
import { FichaMedicaResponse } from "@/services/domains/ficha-medica";
import { useQuery } from "@tanstack/react-query";

interface UseFichaMedicaReturn {
  fichaMedica: FichaMedicaResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para gerenciar o estado de uma ficha médica específica usando React Query
 * @param id - ID da ficha médica a ser buscada
 * @returns {UseFichaMedicaReturn} Estado da ficha médica e funções de controle
 */
export function useFichaMedica(id: string | null): UseFichaMedicaReturn {
  const {
    data: fichaMedicaData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.fichasMedicas.detail?.(id!) ?? ["fichasMedicas", "detail", id],
    queryFn: async () => {
      if (!id) return null;
      return await fichaMedicaApi.buscarFichaMedica(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar a ficha médica. Tente novamente.",
    },
  });

  return {
    fichaMedica: fichaMedicaData ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar a ficha médica. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
