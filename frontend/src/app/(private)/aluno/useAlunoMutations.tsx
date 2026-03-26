"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { alunoApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import { AlunoPostRequest, AlunoPutRequest } from "@/services/domains/aluno/request";

/**
 * Hook para mutações relacionadas aos alunos
 * Inclui create, update e outras operações que modificam dados
 */
export function useAlunoMutations() {
  const queryClient = useQueryClient();

  // Mutation para criar aluno
  const createAluno = useMutation({
    mutationFn: (data: AlunoPostRequest) => alunoApi.criarAluno(data),
    onSuccess: () => {
      // Invalida e refetch a lista de alunos
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.all });
      toast.success("Aluno criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar aluno:", error);
      toast.error("Ocorreu um erro ao criar o aluno no servidor. Tente novamente.");
    },
  });

  // Mutation para deletar aluno
  const deleteAluno = useMutation({
    mutationFn: (id: string) => alunoApi.deleteAluno(id),
    onSuccess: () => {
      // Invalida e refetch a lista de alunos
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.all });
      toast.success("Aluno excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir aluno:", error);
      toast.error("Ocorreu um erro ao excluir o aluno. Tente novamente.");
    },
  });

  // Mutation para atualizar aluno
  const updateAluno = useMutation({
    mutationFn: (data: AlunoPutRequest) => alunoApi.atualizarAluno(data),
    onSuccess: () => {
      // Invalida e refetch a lista de alunos e o detalhe
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.all });
      toast.success("Aluno atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar aluno:", error);
      toast.error("Ocorreu um erro ao atualizar o aluno. Tente novamente.");
    },
  });

  return {
    createAluno,
    deleteAluno,
    updateAluno,
  };
}
