"use client";
import { useQuery } from "@tanstack/react-query";
import { estudanteApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";

/**
 * Busca o boletim do aluno autenticado. Toda a regra de negócio (períodos,
 * escala, médias, recuperação, aprovação e frequência) é resolvida no backend.
 */
export function useBoletim() {
  const {
    data: boletim = null,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.estudante.boletim.all,
    queryFn: () => estudanteApi.getBoletim(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return { boletim, loading, error, refetch };
}
