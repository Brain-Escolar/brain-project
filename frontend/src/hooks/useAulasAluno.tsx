"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { estudanteApi } from "@/services/api";
import { EstudanteAulaResponse } from "@/services/domains/estudante";
import { useQuery } from "@tanstack/react-query";

interface UseAulasAlunoProps {
  data: string;
}

interface UseAulasAlunoReturn {
  aulas: EstudanteAulaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isFetching: boolean;
}

export function useAulasAluno({ data }: UseAulasAlunoProps): UseAulasAlunoReturn {
  const { data: aulaData, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: QUERY_KEYS.estudante.aulas.lists(data),
    queryFn: async () => {
      const response = await estudanteApi.getAulasAluno({ data });
      return response.content;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    aulas: aulaData ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar as aulas. Tente novamente." : null,
    refetch: () => refetch(),
    isFetching,
  };
}
