"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unidadeApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import { UnidadePostRequest, UnidadePutRequest } from "@/services/domains/unidade/request";

/**
 * Hook para mutações relacionadas às unidades
 * Inclui create, update e outras operações que modificam dados
 */
export function useUnidadeMutations() {
  const queryClient = useQueryClient();

  // Mutation para criar unidade
  const createUnidade = useMutation({
    mutationFn: (data: UnidadePostRequest) => unidadeApi.criarUnidade(data),
    onSuccess: () => {
      // Invalida e refetch a lista de unidades
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.unidades.all });
      toast.success("Unidade criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar unidade:", error);
      toast.error("Ocorreu um erro ao criar a unidade no servidor. Tente novamente.");
    },
  });

  // Mutation para deletar unidade
  const deleteUnidade = useMutation({
    mutationFn: (id: string) => unidadeApi.deleteUnidade(id),
    onSuccess: () => {
      // Invalida e refetch a lista de unidades
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.unidades.all });
      toast.success("Unidade excluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir unidade:", error);
      toast.error("Ocorreu um erro ao excluir a unidade. Tente novamente.");
    },
  });

  // Mutation para atualizar unidade
  const updateUnidade = useMutation({
    mutationFn: (data: UnidadePutRequest) => unidadeApi.atualizarUnidade(data),
    onSuccess: () => {
      // Invalida e refetch a lista de unidades e o detalhe
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.unidades.all });
      toast.success("Unidade atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar unidade:", error);
      toast.error("Ocorreu um erro ao atualizar a unidade. Tente novamente.");
    },
  });

  return {
    createUnidade,
    deleteUnidade,
    updateUnidade,
  };
}
