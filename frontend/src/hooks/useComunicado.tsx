"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { comunicadoApi } from "@/services/api";
import { ComunicadoListResponse } from "@/services/domains/comunicado/response";
import { useQuery } from "@tanstack/react-query";

interface UseComunicadoReturn {
  comunicado: ComunicadoListResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useComunicado(id: string | null): UseComunicadoReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.comunicados.detail(Number(id)),
    queryFn: async () => {
      if (!id) return null;
      return await comunicadoApi.getComunicadoById(Number(id));
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    comunicado: data ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar o comunicado. Tente novamente." : null,
    refetch: () => refetch(),
  };
}
