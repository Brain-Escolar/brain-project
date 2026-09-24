"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { documentoApi } from "@/services/api";

/** Checklist de documentos do aluno e de todos os responsáveis (visão da escola). */
export function useDocumentacaoAluno(alunoId: number | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.documentos.aluno(alunoId ?? 0),
    queryFn: () => documentoApi.getDocumentacaoAluno(alunoId as number),
    enabled: alunoId != null,
    refetchOnWindowFocus: false,
  });

  return {
    documentacao: data,
    loading: isLoading,
    error: error ? "Erro ao carregar os documentos do aluno. Tente novamente." : null,
  };
}
