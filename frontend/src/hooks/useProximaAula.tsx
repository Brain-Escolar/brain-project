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

export function useProximaAula(aulaId: string | null): UseProximaAulaReturn {
  const hoje = format(new Date(), "yyyy-MM-dd");
  const agora = new Date();
  const horario = {
    hour: agora.getHours(),
    minute: agora.getMinutes(),
    second: agora.getSeconds(),
    nano: 0,
  };

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.aulas.proximaAula(aulaId || "", hoje),
    queryFn: () => aulaApi.getProximaAula(aulaId!, hoje, horario),
    enabled: !!aulaId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    proximaAula: data ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar a próxima aula." : null,
  };
}
