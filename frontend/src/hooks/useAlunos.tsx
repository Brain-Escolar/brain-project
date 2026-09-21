"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { alunoApi } from "@/services/api";
import { AlunoListaParams } from "@/services/domains/aluno/request";
import { AlunoListaResponse } from "@/services/domains/aluno/response";
import { useQuery } from "@tanstack/react-query";

interface UseAlunosReturn {
  alunos: AlunoListaResponse[];
  totalElements: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isSuccess: boolean;
}

/**
 * Hook para buscar a lista de alunos matriculados usando React Query.
 *
 * Sem `params`, mantém o comportamento antigo (lote único de até 500, sem
 * paginação real) — é o que `/aluno/lista` espera, pois depende da lista
 * inteira em memória pro contador/filtro de cadastro incompleto. Passando
 * `params` (page/size/busca/serieId/unidadeId), pagina de verdade no backend.
 * @returns {UseAlunosReturn} Estado dos alunos e funções de controle
 */
export function useAlunos(params?: AlunoListaParams): UseAlunosReturn {
  const { data, isLoading, error, refetch, isSuccess } = useQuery({
    queryKey: QUERY_KEYS.alunos.lists(params),
    queryFn: () => alunoApi.getListaAlunos(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar a lista de alunos. Tente novamente.",
    },
  });

  return {
    alunos: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    loading: isLoading,
    error: error ? "Erro ao carregar a lista de alunos. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
  };
}
