"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { grupoDisciplinaApi } from "@/services/api";
import { GrupoDisciplinaListaResponse } from "@/services/domains/grupo-disciplina/response";
import { useQuery } from "@tanstack/react-query";

interface UseGruposDisciplinaReturn {
  gruposDisciplina: GrupoDisciplinaListaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para gerenciar o estado da lista de grupos de disciplina usando React Query
 * @returns {UseGruposDisciplinaReturn} Estado da lista de grupos de disciplina e funções de controle
 */
export function useGruposDisciplina(): UseGruposDisciplinaReturn {
  const {
    data: gruposDisciplinaData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.gruposDisciplina.lists(),
    queryFn: async () => {
      const response = await grupoDisciplinaApi.getListaGruposDisciplina();
      return response.content;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar a lista de grupos de disciplina. Tente novamente.",
    },
  });

  return {
    gruposDisciplina: gruposDisciplinaData ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar a lista de grupos de disciplina. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
