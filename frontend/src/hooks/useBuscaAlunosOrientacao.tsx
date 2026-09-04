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
  totalPages: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseBuscaAlunosOrientacaoOptions {
  /**
   * Quando `true` (padrão), só consulta a API se houver termo suficiente ou
   * algum filtro — comportamento do card da tela inicial, que não deve listar a
   * escola inteira sem o usuário pedir. A tela de Alunos passa `false` porque
   * ali a listagem completa é o estado inicial esperado.
   */
  exigirCriterio?: boolean;
}

/** Busca alunos matriculados por nome/matrícula com filtros opcionais. */
export function useBuscaAlunosOrientacao(
  params: BuscaAlunosOrientacaoParams,
  { exigirCriterio = true }: UseBuscaAlunosOrientacaoOptions = {},
): UseBuscaAlunosOrientacaoReturn {
  const termo = params.termo?.trim() ?? "";
  const temFiltro =
    params.unidadeId != null || params.serieId != null || params.turmaId != null;
  const habilitado = !exigirCriterio || termo.length >= MIN_CARACTERES_BUSCA || temFiltro;

  const filtros: BuscaAlunosOrientacaoParams = {
    ...params,
    termo: termo || undefined,
    size: params.size ?? 8,
  };

  const { data, isLoading, error, refetch } = useQuery({
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
    totalPages: data?.totalPages ?? 0,
    loading: habilitado && isLoading,
    error: error ? "Não foi possível buscar alunos. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
  };
}
