"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { aulaApi } from "@/services/api";
import { TarefaAulaResponse } from "@/services/domains/aula/response";
import { useQuery } from "@tanstack/react-query";

interface UseTarefasAulaReturn {
  tarefas: TarefaAulaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTarefasAula(aulaId: string | null, data: string): UseTarefasAulaReturn {
  const { data: result, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.aulas.tarefas(aulaId || "", data),
    queryFn: () => aulaApi.getTarefasByAula(aulaId!, data),
    enabled: !!aulaId && !!data,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    tarefas: result ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar as tarefas." : null,
    refetch: () => refetch(),
  };
}
