"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { alunoApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { AnotacaoAlunoDisciplinaResponse } from "@/services/domains/aluno/response";

export interface AnotacaoComDisciplina extends AnotacaoAlunoDisciplinaResponse {
  disciplinaId: number;
  disciplinaNome: string;
}

interface UseAlunoAnotacoesMultiplasDisciplinasReturn {
  anotacoes: AnotacaoComDisciplina[];
  loading: boolean;
}

export function useAlunoAnotacoesMultiplasDisciplinas(
  alunoId: string | null,
  disciplinas: { id: number; nome: string }[],
): UseAlunoAnotacoesMultiplasDisciplinasReturn {
  const results = useQueries({
    queries: disciplinas.map((disc) => ({
      queryKey: QUERY_KEYS.alunos.anotacoesDisciplina(alunoId || "", String(disc.id)),
      queryFn: () => alunoApi.getAnotacoesPorDisciplina(alunoId!, String(disc.id)),
      enabled: !!alunoId && disciplinas.length > 0,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    })),
  });

  const anotacoes = useMemo(
    () =>
      results.flatMap((result, idx) =>
        (result.data ?? []).map((a) => ({
          ...a,
          disciplinaId: disciplinas[idx]?.id,
          disciplinaNome: disciplinas[idx]?.nome ?? "",
        })),
      ),
    [results, disciplinas],
  );

  const loading = results.some((r) => r.isLoading);

  return { anotacoes, loading };
}
