"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { aulaApi } from "@/services/api";
import { AulaAnotacaoResponse } from "@/services/domains/aula/response";
import { useQuery } from "@tanstack/react-query";

interface UseAnotacoesAulaReturn {
  anotacoes: AulaAnotacaoResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAnotacoesAula(
  aulaId: string | null,
  data: string,
): UseAnotacoesAulaReturn {
  const { data: result, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.aulas.anotacoes(aulaId || "", data),
    queryFn: () => aulaApi.recuperarAnotacoes(aulaId!, data),
    enabled: !!aulaId && !!data,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    anotacoes: result ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar os registros disciplinares." : null,
    refetch: () => refetch(),
  };
}
