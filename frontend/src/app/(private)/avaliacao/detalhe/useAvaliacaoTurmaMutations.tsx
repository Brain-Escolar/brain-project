"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { avaliacaoApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import { AtualizacaoAvaliacaoTurmaRequest, AvaliacaoTurmaInputRequest } from "@/services/domains/avaliacao/request";

/**
 * Hook para mutações das turmas vinculadas a uma avaliação (adicionar, editar datas, remover)
 */
export function useAvaliacaoTurmaMutations(avaliacaoId: string) {
  const queryClient = useQueryClient();

  function invalidar() {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.avaliacaoTurmas.porAvaliacao(avaliacaoId) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.avaliacoes.detail(avaliacaoId) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.avaliacoes.lists() });
  }

  const adicionarTurma = useMutation({
    mutationFn: (dados: AvaliacaoTurmaInputRequest) => avaliacaoApi.adicionarTurma(avaliacaoId, dados),
    onSuccess: () => {
      invalidar();
      toast.success("Turma adicionada à avaliação!");
    },
    onError: () => {
      toast.error("Erro ao adicionar turma. Tente novamente.");
    },
  });

  const atualizarDatasTurma = useMutation({
    mutationFn: ({
      avaliacaoTurmaId,
      dados,
    }: {
      avaliacaoTurmaId: number;
      dados: AtualizacaoAvaliacaoTurmaRequest;
    }) => avaliacaoApi.atualizarDatasTurma(avaliacaoTurmaId, dados),
    onSuccess: () => {
      invalidar();
      toast.success("Datas atualizadas!");
    },
    onError: () => {
      toast.error("Erro ao atualizar as datas da turma. Tente novamente.");
    },
  });

  const removerTurma = useMutation({
    mutationFn: (avaliacaoTurmaId: number) => avaliacaoApi.removerTurma(avaliacaoTurmaId),
    onSuccess: () => {
      invalidar();
      toast.success("Turma removida da avaliação!");
    },
    onError: () => {
      toast.error("Erro ao remover turma. Tente novamente.");
    },
  });

  return { adicionarTurma, atualizarDatasTurma, removerTurma };
}
