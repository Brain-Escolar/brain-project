"use client";
import { useQuery } from "@tanstack/react-query";
import { conversaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useMensagens(conversaId: number | null, page: number = 0) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.conversas.mensagens(conversaId ?? 0, page),
    queryFn: () => conversaApi.listarMensagens(conversaId!, { page, size: 50 }),
    enabled: !!conversaId,
  });

  return {
    mensagens: data?.content ?? [],
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
