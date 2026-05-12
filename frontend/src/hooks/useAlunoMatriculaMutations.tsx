"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { alunoApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";

export function useAlunoMatriculaMutations(alunoId: string) {
  const queryClient = useQueryClient();

  const matricular = useMutation({
    mutationFn: () => alunoApi.matricularAluno(alunoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.detail(alunoId) });
      toast.success("Aluno matriculado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao matricular aluno. Tente novamente.");
    },
  });

  const desmatricular = useMutation({
    mutationFn: () => alunoApi.desmatricularAluno(alunoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.detail(alunoId) });
      toast.success("Aluno desmatriculado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao desmatricular aluno. Tente novamente.");
    },
  });

  return { matricular, desmatricular };
}
