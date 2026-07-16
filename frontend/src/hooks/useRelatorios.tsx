"use client";
import { useQuery } from "@tanstack/react-query";
import { estudanteApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";

/**
 * Busca os relatórios acadêmicos (notas e frequência) do aluno autenticado.
 * Toda a regra de negócio (períodos, escala, médias, recuperação, aprovação,
 * frequência mínima e limite de faltas) é resolvida no backend.
 */
export function useRelatorios() {
  const {
    data: relatorio = null,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.estudante.relatorios.all,
    queryFn: () => estudanteApi.getRelatorio(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return { relatorio, loading, error, refetch };
}
