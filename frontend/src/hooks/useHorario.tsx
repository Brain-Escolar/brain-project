"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { horarioApi } from "@/services/api";
import { HorarioDetalheResponse } from "@/services/domains/horario/response";
import { useQuery } from "@tanstack/react-query";

interface UseHorarioReturn {
  horario: HorarioDetalheResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para buscar um horário específico por ID usando React Query
 * @param id - ID do horário a ser buscado
 * @returns {UseHorarioReturn} Estado do horário e funções de controle
 */
export function useHorario(id: string | null): UseHorarioReturn {
  const {
    data: horarioData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.horarios.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      const response = await horarioApi.getHorarioById(id);
      return response;
    },
    enabled: !!id, // Só executa a query se o ID existir
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar os dados do horário. Tente novamente.",
    },
  });

  return {
    horario: horarioData ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar os dados do horário. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
