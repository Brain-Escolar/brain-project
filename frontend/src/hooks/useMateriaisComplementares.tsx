"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { materialComplementarApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export function useMateriaisComplementares() {
  const {
    data: materiais = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.materiaisComplementares.professor(),
    queryFn: () => materialComplementarApi.listarPorProfessor(),
  });

  return { materiais, loading, error };
}
