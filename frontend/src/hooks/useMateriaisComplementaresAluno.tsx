"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { estudanteApi, responsavelPortalApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

/**
 * Materiais complementares da turma.
 *
 * Sem `alunoId`, a turma vem do token (estudante). Com `alunoId`, vem pelo
 * portal do responsável, que valida o vínculo.
 */
export function useMateriaisComplementaresAluno(alunoId?: number | null, habilitado = true) {
  const doResponsavel = alunoId != null;

  const {
    data: materiais = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: doResponsavel
      ? QUERY_KEYS.responsavel.materiais(alunoId)
      : QUERY_KEYS.estudante.materiaisComplementares.lists(),
    queryFn: () =>
      doResponsavel
        ? responsavelPortalApi.getMateriais(alunoId)
        : estudanteApi.getMateriaisComplementares(),
    enabled: habilitado,
  });

  return { materiais, loading, error };
}
