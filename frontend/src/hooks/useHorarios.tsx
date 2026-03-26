"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { horarioApi } from "@/services/api";
import { HorarioListaResponse } from "@/services/domains/horario/response";

interface UseHorariosReturn {
  horarios: HorarioListaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para gerenciar o estado da lista de horários usando React Query
 * @returns {UseHorariosReturn} Estado da lista de horários e funções de controle
 */
export function useHorarios(): UseHorariosReturn {
  const {
    data: horariosData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.horarios.lists(),
    queryFn: async () => {
      const response = await horarioApi.getListaHorariosPaginada();
      return response.content;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar a lista de horários. Tente novamente.",
    },
  });

  return {
    horarios: horariosData ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar a lista de horários. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}

// Hook adicional para buscar horários para dropdowns (retorna formato simplificado)
export function useHorariosDropdown() {
  const {
    data: horariosData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["horarios", "dropdown"],
    queryFn: async () => {
      const response = await horarioApi.getListaHorarios();
      return response.content;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    horarios: horariosData ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar horários. Tente novamente." : null,
  };
}
