"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { responsavelPortalApi } from "@/services/api";
import { useAlunoSelecionado } from "@/contexts/AlunoSelecionadoContext";

/** Atrasos e ocorrencias disciplinares lancadas pelos professores. */
export function useOcorrenciasAluno() {
  const { alunoId } = useAlunoSelecionado();

  const {
    data: ocorrencias = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.responsavel.ocorrencias(alunoId ?? 0),
    queryFn: () => responsavelPortalApi.getOcorrencias(alunoId as number),
    enabled: alunoId !== null,
    refetchOnWindowFocus: false,
  });

  return {
    ocorrencias,
    loading: isLoading,
    error: error ? "Erro ao carregar as ocorrências. Tente novamente." : null,
  };
}
