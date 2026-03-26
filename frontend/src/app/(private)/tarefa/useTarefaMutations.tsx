"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tarefaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import { TarefaPostRequest, TarefaPutRequest } from "@/services/domains/tarefa/request";

/**
 * Hook para mutações relacionadas às tarefas
 * Inclui create, update e outras operações que modificam dados
 */
export function useTarefaMutations() {
  const queryClient = useQueryClient();

  // Mutation para criar tarefa
  const createTarefa = useMutation({
    mutationFn: (data: TarefaPostRequest) => tarefaApi.criarTarefa(data),
    onSuccess: () => {
      // Invalida e refetch a lista de tarefas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tarefas.all });
      toast.success("Tarefa criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar tarefa:", error);
      toast.error("Ocorreu um erro ao criar a tarefa no servidor. Tente novamente.");
    },
  });

  // Mutation para deletar tarefa
  const deleteTarefa = useMutation({
    mutationFn: (id: string) => tarefaApi.deleteTarefa(id),
    onSuccess: () => {
      // Invalida e refetch a lista de tarefas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tarefas.all });
      toast.success("Tarefa excluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir tarefa:", error);
      toast.error("Ocorreu um erro ao excluir a tarefa. Tente novamente.");
    },
  });

  // Mutation para atualizar tarefa
  const updateTarefa = useMutation({
    mutationFn: (data: TarefaPutRequest) => tarefaApi.atualizarTarefa(data),
    onSuccess: () => {
      // Invalida e refetch a lista de tarefas e o detalhe
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tarefas.all });
      toast.success("Tarefa atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar tarefa:", error);
      toast.error("Ocorreu um erro ao atualizar a tarefa. Tente novamente.");
    },
  });

  return {
    createTarefa,
    deleteTarefa,
    updateTarefa,
  };
}
