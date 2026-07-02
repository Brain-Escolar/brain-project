"use client";
import { useQuery } from "@tanstack/react-query";
import { holeriteApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useHolerites() {
  const {
    data: holerites = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.holerites.meus(),
    queryFn: () => holeriteApi.listarMeus(),
  });

  return { holerites, loading, error };
}
