"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { responsavelPortalApi } from "@/services/api";
import { useAlunoSelecionado } from "@/contexts/AlunoSelecionadoContext";

/**
 * Checklist de documentos do aluno selecionado, na visão do responsável:
 * o aluno e o próprio responsável logado — nunca os outros responsáveis.
 */
export function useDocumentacaoResponsavel() {
  const { alunoId } = useAlunoSelecionado();

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.responsavel.documentos(alunoId ?? 0),
    queryFn: () => responsavelPortalApi.getDocumentacao(alunoId as number),
    enabled: alunoId !== null,
    refetchOnWindowFocus: false,
  });

  return {
    documentacao: data,
    loading: isLoading,
    error: error ? "Erro ao carregar os documentos. Tente novamente." : null,
  };
}
