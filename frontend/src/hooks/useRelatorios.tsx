"use client";
import { useQuery } from "@tanstack/react-query";
import { estudanteApi, responsavelPortalApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";

/**
 * Busca os relatórios acadêmicos (notas e frequência).
 * Toda a regra de negócio (períodos, escala, médias, recuperação, aprovação,
 * frequência mínima e limite de faltas) é resolvida no backend.
 *
 * Sem `alunoId`, o aluno vem do token — comportamento original, usado pelo
 * estudante. Com `alunoId`, busca pelo portal do responsável, que valida o
 * vínculo antes de responder. O `RelatorioDto` é o mesmo nos dois casos.
 */
export function useRelatorios(alunoId?: number | null, habilitado = true) {
  const doResponsavel = alunoId != null;

  const {
    data: relatorio = null,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: doResponsavel
      ? QUERY_KEYS.responsavel.relatorio(alunoId)
      : QUERY_KEYS.estudante.relatorios.all,
    queryFn: () =>
      doResponsavel ? responsavelPortalApi.getRelatorio(alunoId) : estudanteApi.getRelatorio(),
    enabled: habilitado,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return { relatorio, loading, error, refetch };
}
