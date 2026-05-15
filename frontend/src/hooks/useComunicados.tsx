"use client";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { comunicadoApi } from "@/services/api";
import { ComunicadoListResponse } from "@/services/domains/comunicado/response";
import { useQuery } from "@tanstack/react-query";

interface UseComunicadosReturn {
  comunicados: ComunicadoListResponse[];
  totalPages: number;
  totalElements: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
}

export function useComunicados(page: number = 0, size: number = 10): UseComunicadosReturn {
  const { data, isLoading, error, refetch, isSuccess } = useQuery({
    queryKey: QUERY_KEYS.comunicados.lists(page, size),
    queryFn: async () => {
      const response = await comunicadoApi.getListaComunicados({ page, size, sort: "data,desc" });
      return response;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    comunicados: data?.content ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    loading: isLoading,
    error: error ? "Erro ao carregar os comunicados. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
  };
}
