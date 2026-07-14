"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { estudanteApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export function useMateriaisComplementaresAluno() {
  const {
    data: materiais = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.estudante.materiaisComplementares.lists(),
    queryFn: () => estudanteApi.getMateriaisComplementares(),
  });

  return { materiais, loading, error };
}
