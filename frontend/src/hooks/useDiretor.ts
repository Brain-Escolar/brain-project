"use client";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { diretorApi } from "@/services/api";
import { AcompanhamentoParams } from "@/services/domains/diretor";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

/** Indicadores, desempenho por série, frequência mensal e comunicados do painel da Direção. */
export function useInicioDiretor() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.diretor.inicio(),
    queryFn: () => diretorApi.getInicio(),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    inicio: data,
    loading: isLoading,
    error: error ? "Não foi possível carregar o painel da direção." : null,
  };
}

/** Turmas e períodos do ano letivo para os filtros do acompanhamento por turma. */
export function useFiltrosAcompanhamento() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.diretor.filtrosAcompanhamento(),
    queryFn: () => diretorApi.getFiltrosAcompanhamento(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    filtros: data,
    loading: isLoading,
    error: error ? "Não foi possível carregar as turmas." : null,
  };
}

/**
 * Acompanhamento de uma turma no recorte de período/disciplina. Mantém o
 * resultado anterior na tela enquanto o novo recorte carrega.
 */
export function useAcompanhamentoTurma(turmaId: number | undefined, params: AcompanhamentoParams) {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: QUERY_KEYS.diretor.acompanhamentoTurma(turmaId, { ...params }),
    queryFn: () => diretorApi.getAcompanhamentoTurma(turmaId as number, params),
    enabled: turmaId != null,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    acompanhamento: data,
    loading: isLoading,
    atualizando: isFetching && !isLoading,
    error: error ? "Não foi possível carregar o acompanhamento da turma." : null,
  };
}
