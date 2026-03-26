"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { grupoDisciplinaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import {
  GrupoDisciplinaPostRequest,
  GrupoDisciplinaPutRequest,
} from "@/services/domains/grupo-disciplina/request";

/**
 * Hook para mutações relacionadas aos grupos de disciplina
 * Inclui create, update e outras operações que modificam dados
 */
export function useGrupoDisciplinaMutations() {
  const queryClient = useQueryClient();

  // Mutation para criar grupo de disciplina
  const createGrupoDisciplina = useMutation({
    mutationFn: (data: GrupoDisciplinaPostRequest) => grupoDisciplinaApi.criarGrupoDisciplina(data),
    onSuccess: () => {
      // Invalida e refetch a lista de grupos de disciplina e disciplinas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gruposDisciplina.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.disciplinas.all });
      toast.success("Grupo de disciplina criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar grupo de disciplina:", error);
      toast.error("Ocorreu um erro ao criar o grupo de disciplina no servidor. Tente novamente.");
    },
  });

  // Mutation para deletar grupo de disciplina
  const deleteGrupoDisciplina = useMutation({
    mutationFn: (id: string) => grupoDisciplinaApi.deleteGrupoDisciplina(id),
    onSuccess: () => {
      // Invalida e refetch a lista de grupos de disciplina e disciplinas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gruposDisciplina.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.disciplinas.all });
      toast.success("Grupo de disciplina excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir grupo de disciplina:", error);
      toast.error("Ocorreu um erro ao excluir o grupo de disciplina. Tente novamente.");
    },
  });

  // Mutation para atualizar grupo de disciplina
  const updateGrupoDisciplina = useMutation({
    mutationFn: (data: GrupoDisciplinaPutRequest) =>
      grupoDisciplinaApi.atualizarGrupoDisciplina(data),
    onSuccess: () => {
      // Invalida e refetch a lista de grupos de disciplina e disciplinas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gruposDisciplina.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.disciplinas.all });
      toast.success("Grupo de disciplina atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar grupo de disciplina:", error);
      toast.error("Ocorreu um erro ao atualizar o grupo de disciplina. Tente novamente.");
    },
  });

  return {
    createGrupoDisciplina,
    deleteGrupoDisciplina,
    updateGrupoDisciplina,
  };
}
