"use client";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { orientacaoApi } from "@/services/api";
import {
  AlunoOrientacaoResponse,
  BuscaAlunosOrientacaoParams,
} from "@/services/domains/orientacao";
import { useQuery } from "@tanstack/react-query";

/** Nº mínimo de caracteres para disparar a busca por texto. */
export const MIN_CARACTERES_BUSCA = 2;

interface UseBuscaAlunosOrientacaoReturn {
  alunos: AlunoOrientacaoResponse[];
  totalElements: number;
  loading: boolean;
  error: string | null;
}

/**
 * Busca alunos matriculados por nome/matrícula com filtros opcionais.
 * Só consulta a API quando há termo suficiente ou algum filtro aplicado —
 * a tela inicial não deve listar a escola inteira sem o usuário pedir.
 */
export function useBuscaAlunosOrientacao(
  params: BuscaAlunosOrientacaoParams,
): UseBuscaAlunosOrientacaoReturn {
  const termo = params.termo?.trim() ?? "";
  const temFiltro =
    params.unidadeId != null || params.serieId != null || params.turmaId != null;
  const habilitado = termo.length >= MIN_CARACTERES_BUSCA || temFiltro;

  const filtros: BuscaAlunosOrientacaoParams = {
    ...params,
    termo: termo || undefined,
    size: params.size ?? 8,
  };

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.orientacao.buscaAlunos(filtros as Record<string, unknown>),
    queryFn: () => orientacaoApi.buscarAlunos(filtros),
    enabled: habilitado,
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    alunos: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    loading: habilitado && isLoading,
    error: error ? "Não foi possível buscar alunos. Tente novamente." : null,
  };
}
