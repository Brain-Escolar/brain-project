"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { avaliacaoApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import { AvaliacaoPostRequest, AvaliacaoPutRequest } from "@/services/domains/avaliacao/request";

/**
 * Hook para mutações relacionadas às avaliações
 * Inclui create, update e outras operações que modificam dados
 */
export function useAvaliacaoMutations() {
  const queryClient = useQueryClient();

  // Mutation para criar avaliação
  const createAvaliacao = useMutation({
    mutationFn: (data: AvaliacaoPostRequest) => avaliacaoApi.criarAvaliacao(data),
    onSuccess: () => {
      // Invalida e refetch a lista de avaliações
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.avaliacoes.all });
      toast.success("Avaliação criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar avaliação:", error);
      toast.error("Ocorreu um erro ao criar a avaliação no servidor. Tente novamente.");
    },
  });

  // Mutation para deletar avaliação
  const deleteAvaliacao = useMutation({
    mutationFn: (id: string) => avaliacaoApi.deleteAvaliacao(id),
    onSuccess: () => {
      // Invalida e refetch a lista de avaliações
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.avaliacoes.all });
      toast.success("Avaliação excluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir avaliação:", error);
      toast.error("Ocorreu um erro ao excluir a avaliação. Tente novamente.");
    },
  });

  // Mutation para atualizar avaliação
  const updateAvaliacao = useMutation({
    mutationFn: (data: AvaliacaoPutRequest) => avaliacaoApi.atualizarAvaliacao(data),
    onSuccess: () => {
      // Invalida e refetch a lista de avaliações e o detalhe
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.avaliacoes.all });
      toast.success("Avaliação atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar avaliação:", error);
      toast.error("Ocorreu um erro ao atualizar a avaliação. Tente novamente.");
    },
  });

  return {
    createAvaliacao,
    deleteAvaliacao,
    updateAvaliacao,
  };
}
