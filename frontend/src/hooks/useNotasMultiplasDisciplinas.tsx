"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { notaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { NotaDisciplinaItemResponse } from "@/services/domains/notas/response";

export interface NotaComDisciplina extends NotaDisciplinaItemResponse {
  disciplinaId: number;
  disciplinaNome: string;
}

interface UseNotasMultiplasDisciplinasReturn {
  notas: NotaComDisciplina[];
  loading: boolean;
}

export function useNotasMultiplasDisciplinas(
  alunoId: string | null,
  disciplinas: { id: number; nome: string }[],
): UseNotasMultiplasDisciplinasReturn {
  const results = useQueries({
    queries: disciplinas.map((disc) => ({
      queryKey: QUERY_KEYS.notas.porAlunoDisciplina(alunoId || "", String(disc.id)),
      queryFn: () => notaApi.getNotasPorAlunoDisciplina(alunoId!, String(disc.id)),
      enabled: !!alunoId && disciplinas.length > 0,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    })),
  });

  const notas = useMemo(
    () =>
      results.flatMap((result, idx) =>
        (result.data?.notas ?? []).map((n) => ({
          ...n,
          disciplinaId: disciplinas[idx]?.id,
          disciplinaNome: disciplinas[idx]?.nome ?? "",
        })),
      ),
    [results, disciplinas],
  );

  const loading = results.some((r) => r.isLoading);

  return { notas, loading };
}
