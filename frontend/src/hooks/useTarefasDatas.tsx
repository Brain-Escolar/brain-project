"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { aulaApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

interface UseTarefasDatasReturn {
  datas: string[];
  loading: boolean;
  error: string | null;
}

export function useTarefasDatas(aulaId: string | null): UseTarefasDatasReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.aulas.tarefasDatas(aulaId || ""),
    queryFn: () => aulaApi.getTarefasDatas(aulaId!),
    enabled: !!aulaId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    datas: data ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar as datas de tarefas." : null,
  };
}
