"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { aulaApi } from "@/services/api";
import { ProximaAulaResponse } from "@/services/domains/aula/response";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface UseProximaAulaReturn {
  proximaAula: ProximaAulaResponse | null;
  loading: boolean;
  error: string | null;
}

export function useProximaAula(aulaId: string | null, dataReferencia?: string): UseProximaAulaReturn {
  const hoje = format(new Date(), "yyyy-MM-dd");
  const data = dataReferencia ?? hoje;
  // "23:59:59" garante que retorna a próxima ocorrência a partir do dia seguinte,
  // não a própria aula do mesmo dia
  const horario = dataReferencia ? "23:59:59" : format(new Date(), "HH:mm:ss");

  const { data: result, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.aulas.proximaAula(aulaId || "", data),
    queryFn: () => aulaApi.getProximaAula(aulaId!, data, horario),
    enabled: !!aulaId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    proximaAula: result ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar a próxima aula." : null,
  };
}
