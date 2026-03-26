"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { gradeCurricularApi } from "@/services/api";
import { GradeCurricularDetalheResponse } from "@/services/domains/grade-curricular/response";
import { useQuery } from "@tanstack/react-query";

interface UseGradeCurricularReturn {
  gradeCurricular: GradeCurricularDetalheResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

export function useGradeCurricular(id: string | null): UseGradeCurricularReturn {
  const {
    data: gradeData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.gradesCurriculares.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      const response = await gradeCurricularApi.getGradeCurricularById(id);
      return response;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar os dados da grade curricular. Tente novamente.",
    },
  });

  return {
    gradeCurricular: gradeData ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar os dados da grade curricular. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
