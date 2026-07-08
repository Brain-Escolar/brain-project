"use client";

import { useQuery } from "@tanstack/react-query";
import { professorApi } from "@/services/api";
import { ProfessorAulaSemanalResponse } from "@/services/domains/professor";
import { QUERY_KEYS } from "@/constants/queryKeys";

const DIAS_SEMANA = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

export function getWeekDays(date: Date): Date[] {
  const d = new Date(date);
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - d.getDay());

  return Array.from({ length: 7 }, (_, i) => {
    const weekDay = new Date(sunday);
    weekDay.setDate(sunday.getDate() + i);
    return weekDay;
  });
}

interface UseAulasSemanaReturn {
  aulasByDay: ProfessorAulaSemanalResponse[][];
  weekDays: Date[];
  loading: boolean;
  error: boolean;
}

export function useAulasSemana(selectedDate: Date): UseAulasSemanaReturn {
  const weekDays = getWeekDays(selectedDate);

  const { data, isLoading, isError } = useQuery({
    queryKey: [...QUERY_KEYS.aulas.all, "semana"],
    queryFn: () => professorApi.getAulasSemanalProfessor(),
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const aulasByDay = DIAS_SEMANA.map(
    (dia) => (data ?? []).filter((a) => a.diaDaSemana === dia),
  );

  return { aulasByDay, weekDays, loading: isLoading, error: isError };
}
