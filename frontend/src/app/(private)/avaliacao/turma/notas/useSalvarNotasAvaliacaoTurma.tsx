"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { avaliacaoApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import { SalvarNotasAvaliacaoTurmaRequest } from "@/services/domains/avaliacao/request";

/**
 * Hook para salvar as notas dos alunos de uma turma numa avaliação
 */
export function useSalvarNotasAvaliacaoTurma(avaliacaoId: string) {
  const queryClient = useQueryClient();

  const salvarNotas = useMutation({
    mutationFn: (data: SalvarNotasAvaliacaoTurmaRequest) => avaliacaoApi.salvarNotasAvaliacaoTurma(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.avaliacaoTurmas.porAvaliacao(avaliacaoId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.avaliacoes.detail(avaliacaoId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.avaliacoes.lists() });
      toast.success("Notas salvas com sucesso!");
    },
    onError: () => {
      toast.error("Ocorreu um erro ao salvar as notas. Tente novamente.");
    },
  });

  return { salvarNotas };
}
