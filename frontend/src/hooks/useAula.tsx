"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { aulaApi } from "@/services/api";
import { AulaAlunoResponse } from "@/services/domains/aula";
import { useQuery } from "@tanstack/react-query";

interface UseAulaReturn {
  alunos: AulaAlunoResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

interface UseAulaProps {
  idAula: string;
}

/**
 * Hook para gerenciar o estado dos alunos de uma aula usando React Query
 * @param {UseAulaProps} props - Propriedades do hook
 * @returns {UseAulaReturn} Estado dos alunos e funções de controle
 */
export function useAula({ idAula }: UseAulaProps): UseAulaReturn {
  const {
    data: aulaData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.aulas.detail(idAula),
    queryFn: async () => {
      const response = await aulaApi.listaAlunosByIdAula(idAula);
      return response || []; // Garante que sempre retorna um array
    },
    enabled: !!idAula, // Só executa se idAula estiver disponível
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar os alunos da aula. Tente novamente.",
    },
  });

  return {
    alunos: aulaData ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar os alunos da aula. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
