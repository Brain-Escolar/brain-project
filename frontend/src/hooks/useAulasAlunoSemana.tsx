"use client";

import { useQuery } from "@tanstack/react-query";
import { estudanteApi } from "@/services/api";
import { EstudanteAulaResponse } from "@/services/domains/estudante";
import { QUERY_KEYS } from "@/constants/queryKeys";

const DIAS_SEMANA = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const;

interface UseAulasAlunoSemanaReturn {
  aulasByDay: EstudanteAulaResponse[][];
  loading: boolean;
  error: boolean;
}

export function useAulasAlunoSemana(): UseAulasAlunoSemanaReturn {
  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.estudante.aulas.semana(),
    queryFn: () => estudanteApi.getAulasSemanalAluno(),
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const aulasByDay = DIAS_SEMANA.map(
    (dia) => (data ?? []).filter((a) => a.diaDaSemana === dia),
  );

  return { aulasByDay, loading: isLoading, error: isError };
}
