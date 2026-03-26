"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { grupoDisciplinaApi } from "@/services/api";
import { GrupoDisciplinaDetalheResponse } from "@/services/domains/grupo-disciplina/response";
import { useQuery } from "@tanstack/react-query";

interface UseGrupoDisciplinaReturn {
  grupoDisciplina: GrupoDisciplinaDetalheResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para buscar um grupo de disciplina específico por ID usando React Query
 * @param id - ID do grupo de disciplina a ser buscado
 * @returns {UseGrupoDisciplinaReturn} Estado do grupo de disciplina e funções de controle
 */
export function useGrupoDisciplina(id: string | null): UseGrupoDisciplinaReturn {
  const {
    data: grupoDisciplinaData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.gruposDisciplina.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      const response = await grupoDisciplinaApi.getGrupoDisciplinaById(id);
      return response;
    },
    enabled: !!id, // Só executa a query se o ID existir
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar os dados do grupo de disciplina. Tente novamente.",
    },
  });

  return {
    grupoDisciplina: grupoDisciplinaData ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar os dados do grupo de disciplina. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
