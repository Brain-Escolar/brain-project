"use client";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { diretorApi } from "@/services/api";
import { AcompanhamentoParams } from "@/services/domains/diretor";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

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

/** Professores com a situação do diário de classe e das notas no período corrente. */
export function useProfessoresDiretor() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.diretor.professores(),
    queryFn: () => diretorApi.getProfessores(),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    professores: data,
    loading: isLoading,
    error: error ? "Não foi possível carregar os professores." : null,
  };
}

/**
 * Acompanhamento de um professor. Trocar de semana no diário mantém a tela
 * anterior enquanto a nova carrega.
 */
export function useAcompanhamentoProfessor(professorId: number | undefined, semana?: string) {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: QUERY_KEYS.diretor.professor(professorId, semana),
    queryFn: () => diretorApi.getAcompanhamentoProfessor(professorId as number, semana),
    enabled: professorId != null && !Number.isNaN(professorId),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    acompanhamento: data,
    loading: isLoading,
    atualizando: isFetching && !isLoading,
    error: error ? "Não foi possível carregar o acompanhamento do professor." : null,
  };
}

/** Envia aos professores um alerta com as pendências deles. */
export function useLembrarProfessores() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (professorIds?: number[]) => diretorApi.lembrarProfessores(professorIds),
    onSuccess: ({ enviados }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.diretor.professores() });
      if (enviados === 0) toast.info("Nenhum professor com pendências para lembrar.");
      else toast.success(enviados === 1 ? "Lembrete enviado." : `Lembrete enviado a ${enviados} professores.`);
    },
    onError: () => toast.error("Não foi possível enviar o lembrete. Tente novamente."),
  });
}
