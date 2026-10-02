"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { alunoApi } from "@/services/api";
import { SituacaoFamiliarRequest } from "@/services/domains/aluno/request";
import { SituacaoFamiliarResponse } from "@/services/domains/aluno/response";

interface UseSituacaoFamiliarReturn {
  situacao: SituacaoFamiliarResponse | null;
  loading: boolean;
  error: string | null;
  salvar: ReturnType<typeof useMutation<SituacaoFamiliarResponse, Error, SituacaoFamiliarRequest>>;
}

/**
 * Situação familiar de um aluno. O GET já traz o catálogo de opções junto, então
 * a aba monta os checkboxes com uma chamada só.
 */
export function useSituacaoFamiliar(
  alunoId: string | null,
  enabled = true,
): UseSituacaoFamiliarReturn {
  const queryClient = useQueryClient();
  const habilitado = !!alunoId && enabled;

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.alunos.situacaoFamiliar(alunoId || ""),
    queryFn: () => alunoApi.getSituacaoFamiliar(alunoId!),
    enabled: habilitado,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const salvar = useMutation<SituacaoFamiliarResponse, Error, SituacaoFamiliarRequest>({
    mutationFn: (dados) => alunoApi.salvarSituacaoFamiliar(alunoId!, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.alunos.situacaoFamiliar(alunoId || ""),
      });
      toast.success("Situação familiar salva!");
    },
    onError: () => toast.error("Erro ao salvar a situação familiar. Tente novamente."),
  });

  return {
    situacao: data ?? null,
    loading: habilitado && isLoading,
    error: error ? "Erro ao carregar a situação familiar." : null,
    salvar,
  };
}
