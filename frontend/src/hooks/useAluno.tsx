"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { alunoApi } from "@/services/api";
import { AlunoDetalheResponse } from "@/services/domains/aluno/response";
import { useQuery } from "@tanstack/react-query";

interface UseAlunoReturn {
  aluno: AlunoDetalheResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

/**
 * Hook para buscar um aluno específico por ID usando React Query
 * @param id - ID do aluno a ser buscado
 * @returns {UseAlunoReturn} Estado do aluno e funções de controle
 */
export function useAluno(id: string | null): UseAlunoReturn {
  const {
    data: alunoData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.alunos.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      const response = await alunoApi.getAlunoById(id);
      return response;
    },
    enabled: !!id, // Só executa a query se o ID existir
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar os dados do aluno. Tente novamente.",
    },
  });

  return {
    aluno: alunoData ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar os dados do aluno. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
