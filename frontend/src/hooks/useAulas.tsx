"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { professorApi } from "@/services/api";
import { ProfessorAulaResponse } from "@/services/domains/professor";
import { useQuery } from "@tanstack/react-query";

interface UseAulasReturn {
  aulas: ProfessorAulaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

interface UseAulasProps {
  data: string;
}

/**
 * Hook para gerenciar o estado das aulas usando React Query
 * @param {UseAulasProps} props - Propriedades do hook
 * @returns {UseAulasReturn} Estado das aulas e funções de controle
 */
export function useAulas({ data }: UseAulasProps): UseAulasReturn {
  const {
    data: aulaData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.aulas.lists(data),
    queryFn: async () => {
      const response = await professorApi.getAulasProfessor({ data });
      return response.content;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar as aulas. Tente novamente.",
    },
  });

  return {
    aulas: aulaData ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar as aulas. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
