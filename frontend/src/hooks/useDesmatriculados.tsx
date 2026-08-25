"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { alunoApi } from "@/services/api";
import { AlunoListaResponse } from "@/services/domains/aluno/response";
import { useQuery } from "@tanstack/react-query";

interface UseDesmatriculadosReturn {
  desmatriculados: AlunoListaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
}

/**
 * Hook para buscar a lista de alunos desmatriculados usando React Query
 * @returns {UseDesmatriculadosReturn} Estado dos desmatriculados e funções de controle
 */
export function useDesmatriculados(): UseDesmatriculadosReturn {
  const { data, isLoading, error, refetch, isSuccess } = useQuery({
    queryKey: QUERY_KEYS.alunos.desmatriculados(),
    queryFn: async () => {
      const response = await alunoApi.getDesmatriculados();
      return response.content || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar a lista de desmatriculados. Tente novamente.",
    },
  });

  return {
    desmatriculados: data ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar a lista de desmatriculados. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
  };
}
