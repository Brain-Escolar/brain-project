"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gradeCurricularApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import {
  GradeCurricularPostRequest,
  GradeCurricularPutRequest,
} from "@/services/domains/grade-curricular/request";

export function useGradeCurricularMutations() {
  const queryClient = useQueryClient();

  const createGradeCurricular = useMutation({
    mutationFn: (data: GradeCurricularPostRequest) =>
      gradeCurricularApi.criarGradeCurricular(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gradesCurriculares.all });
      toast.success("Grade curricular criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar grade curricular:", error);
      toast.error("Ocorreu um erro ao criar a grade curricular. Tente novamente.");
    },
  });

  const updateGradeCurricular = useMutation({
    mutationFn: (data: GradeCurricularPutRequest) =>
      gradeCurricularApi.atualizarGradeCurricular(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gradesCurriculares.all });
      toast.success("Grade curricular atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar grade curricular:", error);
      toast.error("Ocorreu um erro ao atualizar a grade curricular. Tente novamente.");
    },
  });

  const deleteGradeCurricular = useMutation({
    mutationFn: (id: string) => gradeCurricularApi.deleteGradeCurricular(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gradesCurriculares.all });
      toast.success("Grade curricular excluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir grade curricular:", error);
      toast.error("Ocorreu um erro ao excluir a grade curricular. Tente novamente.");
    },
  });

  return {
    createGradeCurricular,
    updateGradeCurricular,
    deleteGradeCurricular,
  };
}
