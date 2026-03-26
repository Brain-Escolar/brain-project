"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import { NotaPostRequest, NotaPutRequest } from "@/services/domains/notas/request";

/**
 * Hook para mutações relacionadas às notas
 * Inclui create, update e outras operações que modificam dados
 */
export function useNotaMutations() {
  const queryClient = useQueryClient();

  // Mutation para criar nota
  const createNota = useMutation({
    mutationFn: (data: NotaPostRequest) => notaApi.criarNota(data),
    onSuccess: () => {
      // Invalida e refetch a lista de notas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notas.all });
      toast.success("Nota criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar nota:", error);
      toast.error("Ocorreu um erro ao criar a nota no servidor. Tente novamente.");
    },
  });

  // Mutation para deletar nota
  const deleteNota = useMutation({
    mutationFn: (id: string) => notaApi.deleteNota(id),
    onSuccess: () => {
      // Invalida e refetch a lista de notas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notas.all });
      toast.success("Nota excluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir nota:", error);
      toast.error("Ocorreu um erro ao excluir a nota. Tente novamente.");
    },
  });

  // Mutation para atualizar nota
  const updateNota = useMutation({
    mutationFn: (data: NotaPutRequest) => notaApi.atualizarNota(data),
    onSuccess: () => {
      // Invalida e refetch a lista de notas e o detalhe
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notas.all });
      toast.success("Nota atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar nota:", error);
      toast.error("Ocorreu um erro ao atualizar a nota. Tente novamente.");
    },
  });

  return {
    createNota,
    deleteNota,
    updateNota,
  };
}
