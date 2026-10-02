"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { alunoApi } from "@/services/api";
import { AtendimentoPsicologicoRequest } from "@/services/domains/aluno/request";
import { AtendimentoPsicologicoResponse } from "@/services/domains/aluno/response";

interface UseAtendimentosPsicologicosReturn {
  atendimentos: AtendimentoPsicologicoResponse[];
  loading: boolean;
  error: string | null;
  registrar: ReturnType<
    typeof useMutation<AtendimentoPsicologicoResponse, Error, AtendimentoPsicologicoRequest>
  >;
}

/**
 * Atendimentos psicológicos de um aluno. Só há leitura e inclusão — o registro
 * é histórico clínico e a API não expõe edição nem remoção.
 */
export function useAtendimentosPsicologicos(
  alunoId: string | null,
  enabled = true,
): UseAtendimentosPsicologicosReturn {
  const queryClient = useQueryClient();
  const habilitado = !!alunoId && enabled;

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.alunos.atendimentosPsicologicos(alunoId || ""),
    queryFn: () => alunoApi.getAtendimentosPsicologicos(alunoId!),
    enabled: habilitado,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const registrar = useMutation<
    AtendimentoPsicologicoResponse,
    Error,
    AtendimentoPsicologicoRequest
  >({
    mutationFn: (dados) => alunoApi.registrarAtendimentoPsicologico(alunoId!, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.alunos.atendimentosPsicologicos(alunoId || ""),
      });
      toast.success("Atendimento registrado!");
    },
    onError: () => toast.error("Erro ao registrar o atendimento. Tente novamente."),
  });

  return {
    atendimentos: data ?? [],
    loading: habilitado && isLoading,
    error: error ? "Erro ao carregar os atendimentos." : null,
    registrar,
  };
}
