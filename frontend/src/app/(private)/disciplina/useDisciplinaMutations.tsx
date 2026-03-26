"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { disciplinaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import { DisciplinaPostRequest, DisciplinaPutRequest } from "@/services/domains/disciplina/request";

/**
 * Hook para mutações relacionadas às disciplinas
 * Inclui create, update e outras operações que modificam dados
 */
export function useDisciplinaMutations() {
  const queryClient = useQueryClient();

  // Mutation para criar disciplina
  const createDisciplina = useMutation({
    mutationFn: (data: DisciplinaPostRequest) => disciplinaApi.criarDisciplina(data),
    onSuccess: () => {
      // Invalida e refetch a lista de disciplinas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.disciplinas.all });
      toast.success("Disciplina criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar disciplina:", error);
      toast.error("Ocorreu um erro ao criar a disciplina no servidor. Tente novamente.");
    },
  });

  // Mutation para deletar disciplina
  const deleteDisciplina = useMutation({
    mutationFn: (id: string) => disciplinaApi.deleteDisciplina(id),
    onSuccess: () => {
      // Invalida e refetch a lista de disciplinas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.disciplinas.all });
      toast.success("Disciplina excluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir disciplina:", error);
      toast.error("Ocorreu um erro ao excluir a disciplina. Tente novamente.");
    },
  });

  // Mutation para atualizar disciplina
  const updateDisciplina = useMutation({
    mutationFn: (data: DisciplinaPutRequest) => disciplinaApi.atualizarDisciplina(data),
    onSuccess: () => {
      // Invalida e refetch a lista de disciplinas e o detalhe
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.disciplinas.all });
      toast.success("Disciplina atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar disciplina:", error);
      toast.error("Ocorreu um erro ao atualizar a disciplina. Tente novamente.");
    },
  });

  return {
    createDisciplina,
    deleteDisciplina,
    updateDisciplina,
  };
}
