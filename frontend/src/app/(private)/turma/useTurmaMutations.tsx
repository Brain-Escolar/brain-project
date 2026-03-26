"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { turmaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import { TurmaPostRequest, TurmaPutRequest } from "@/services/domains/turma/request";

/**
 * Hook para mutações relacionadas às turmas
 * Inclui create, update e outras operações que modificam dados
 */
export function useTurmaMutations() {
  const queryClient = useQueryClient();

  // Mutation para criar turma
  const createTurma = useMutation({
    mutationFn: (data: TurmaPostRequest) => turmaApi.criarTurma(data),
    onSuccess: () => {
      // Invalida e refetch a lista de turmas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.turmas.all });
      toast.success("Turma criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar turma:", error);
      toast.error("Ocorreu um erro ao criar a turma no servidor. Tente novamente.");
    },
  });

  // Mutation para deletar turma
  const deleteTurma = useMutation({
    mutationFn: (id: string) => turmaApi.deleteTurma(id),
    onSuccess: () => {
      // Invalida e refetch a lista de turmas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.turmas.all });
      toast.success("Turma excluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir turma:", error);
      toast.error("Ocorreu um erro ao excluir a turma. Tente novamente.");
    },
  });

  // Mutation para atualizar turma
  const updateTurma = useMutation({
    mutationFn: (data: TurmaPutRequest) => turmaApi.atualizarTurma(data),
    onSuccess: () => {
      // Invalida e refetch a lista de turmas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.turmas.all });
      toast.success("Turma atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar turma:", error);
      toast.error("Ocorreu um erro ao atualizar a turma. Tente novamente.");
    },
  });

  return {
    createTurma,
    deleteTurma,
    updateTurma,
  };
}
