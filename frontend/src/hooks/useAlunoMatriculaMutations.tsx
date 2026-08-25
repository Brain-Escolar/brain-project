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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.leads() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.matriculados() });
      toast.success("Aluno matriculado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao matricular aluno. Tente novamente.");
    },
  });

  const desmatricular = useMutation({
    mutationFn: (motivo?: string) =>
      alunoApi.desmatricularAluno(alunoId, motivo ? { motivo } : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.detail(alunoId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.leads() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.matriculados() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.desmatriculados() });
      toast.success("Aluno desmatriculado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao desmatricular aluno. Tente novamente.");
    },
  });

  const rematricular = useMutation({
    mutationFn: () => alunoApi.rematricularAluno(alunoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.detail(alunoId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.leads() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.matriculados() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.desmatriculados() });
      toast.success("Aluno rematriculado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao rematricular aluno. Tente novamente.");
    },
  });

  return { matricular, desmatricular, rematricular };
}
