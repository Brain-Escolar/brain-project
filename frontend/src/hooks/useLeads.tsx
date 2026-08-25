"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { alunoApi } from "@/services/api";
import { AlunoListaResponse } from "@/services/domains/aluno/response";
import { useQuery } from "@tanstack/react-query";

interface UseLeadsReturn {
  leads: AlunoListaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
}

/**
 * Hook para buscar a lista de leads (alunos ainda não matriculados) usando React Query
 * @returns {UseLeadsReturn} Estado dos leads e funções de controle
 */
export function useLeads(): UseLeadsReturn {
  const { data, isLoading, error, refetch, isSuccess } = useQuery({
    queryKey: QUERY_KEYS.alunos.leads(),
    queryFn: async () => {
      const response = await alunoApi.getLeads();
      return response.content || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar a lista de leads. Tente novamente.",
    },
  });

  return {
    leads: data ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar a lista de leads. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
  };
}
