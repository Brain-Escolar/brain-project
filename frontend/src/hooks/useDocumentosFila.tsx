"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { documentoApi } from "@/services/api";
import { DocumentoFilaParams } from "@/services/domains/documento";

/** Fila de validação de documentos. Sem status, o backend devolve os EM_ANALISE. */
export function useDocumentosFila(params?: DocumentoFilaParams) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.documentos.fila(params),
    queryFn: () => documentoApi.getFila(params),
    refetchOnWindowFocus: false,
  });

  return {
    documentos: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    loading: isLoading,
    error: error ? "Erro ao carregar a fila de documentos. Tente novamente." : null,
  };
}
