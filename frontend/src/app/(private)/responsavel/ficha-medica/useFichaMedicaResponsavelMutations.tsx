"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { responsavelPortalApi } from "@/services/api";
import { MedicacaoPostRequest } from "@/services/domains/responsavel-portal";

/**
 * As duas unicas escritas do portal do responsavel.
 *
 * Ambas invalidam a ficha do aluno em questao — nunca a chave `all` do
 * responsavel, que derrubaria tambem resumo, relatorio e grade horaria.
 */
export function useFichaMedicaResponsavelMutations(alunoId: number | null) {
  const queryClient = useQueryClient();

  const invalidarFicha = () => {
    if (alunoId == null) return;
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.responsavel.fichaMedica(alunoId) });
  };

  const incluirMedicacao = useMutation({
    mutationFn: (dados: MedicacaoPostRequest) =>
      responsavelPortalApi.incluirMedicacao(alunoId as number, dados),
    onSuccess: () => {
      invalidarFicha();
      toast.success("Medicação adicionada com sucesso!");
    },
    onError: () => {
      toast.error("Ocorreu um erro ao adicionar a medicação. Tente novamente.");
    },
  });

  const anexarLaudo = useMutation({
    mutationFn: (arquivo: File) => responsavelPortalApi.anexarLaudo(alunoId as number, arquivo),
    onSuccess: () => {
      invalidarFicha();
      toast.success("Laudo anexado. A Orientação Educacional foi avisada.");
    },
    onError: () => {
      toast.error("Ocorreu um erro ao anexar o laudo. Tente novamente.");
    },
  });

  return { incluirMedicacao, anexarLaudo };
}
