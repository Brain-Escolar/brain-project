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

interface UseAlunosOptions {
  /**
   * Quando `false`, a consulta não é disparada. Serve para telas que escolhem a
   * fonte de dados por perfil e não devem buscar a lista inteira à toa.
   */
  enabled?: boolean;
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
export function useAlunos(
  optionsOrParams: UseAlunosOptions | AlunoListaParams = {},
): UseAlunosReturn {
  const options = "enabled" in optionsOrParams ? optionsOrParams : undefined;
  const params = options ? undefined : optionsOrParams as AlunoListaParams;
  const enabled = options?.enabled ?? true;
  const { data, isLoading, error, refetch, isSuccess } = useQuery({
    queryKey: QUERY_KEYS.alunos.lists(params),
    queryFn: () => alunoApi.getListaAlunos(params),
    enabled,
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
    loading: enabled && isLoading,
    error: error ? "Erro ao carregar a lista de alunos. Tente novamente." : null,
    refetch: () => {
      refetch();
    },
    isSuccess,
  };
}
