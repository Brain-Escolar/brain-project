"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { eventoApi } from "@/services/api";
import { EventoResponse } from "@/services/domains/evento";
import { useQuery } from "@tanstack/react-query";

interface UseEventosProps {
  dataInicio: string;
  dataFim: string;
}

interface UseEventosReturn {
  eventos: EventoResponse[];
  loading: boolean;
  error: string | null;
}

export function useEventos({ dataInicio, dataFim }: UseEventosProps): UseEventosReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.eventos.periodo(dataInicio, dataFim),
    queryFn: async () => {
      const response = await eventoApi.listar(dataInicio, dataFim);
      return response.content;
    },
    enabled: !!dataInicio && !!dataFim,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    eventos: data ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar eventos. Tente novamente." : null,
  };
}
