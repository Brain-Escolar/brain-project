"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { gradeCurricularApi } from "@/services/api";
import { GradeCurricularListaResponse } from "@/services/domains/grade-curricular/response";
import { useQuery } from "@tanstack/react-query";

interface UseGradesCurricularesReturn {
  gradesCurriculares: GradeCurricularListaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
}

export function useGradesCurriculares(): UseGradesCurricularesReturn {
  const {
    data: gradesData,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.gradesCurriculares.lists(),
    queryFn: async () => {
      const response = await gradeCurricularApi.getListaGradesCurriculares();
      return response.content;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar a lista de grades curriculares. Tente novamente.",
    },
  });

  return {
    gradesCurriculares: gradesData ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar a lista de grades curriculares. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
    isFetching,
  };
}
