"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { alunoApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import {
  FichaMedicaDadosClinicosRequest,
  LaudoMedicoRequest,
  MedicacaoRequest,
} from "@/services/domains/aluno/request";

/**
 * Escritas na ficha médica de um aluno. Todas as rotas devolvem a ficha
 * completa, então basta invalidar a query da ficha depois de cada uma.
 */
export function useFichaMedicaAlunoMutations(alunoId: string) {
  const queryClient = useQueryClient();

  function invalidar() {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.fichaMedica(alunoId) });
  }

  const salvarDadosClinicos = useMutation({
    mutationFn: (dados: FichaMedicaDadosClinicosRequest) =>
      alunoApi.atualizarFichaMedica(alunoId, dados),
    onSuccess: () => {
      invalidar();
      toast.success("Ficha médica atualizada!");
    },
    onError: () => toast.error("Erro ao atualizar a ficha médica. Tente novamente."),
  });

  const anexarLaudo = useMutation({
    mutationFn: (dados: LaudoMedicoRequest) => alunoApi.anexarLaudo(alunoId, dados),
    onSuccess: () => {
      invalidar();
      toast.success("Laudo anexado com sucesso!");
    },
    onError: () => toast.error("Erro ao anexar o laudo. Tente novamente."),
  });

  const removerLaudo = useMutation({
    mutationFn: (laudoId: number) => alunoApi.removerLaudo(alunoId, laudoId),
    onSuccess: () => {
      invalidar();
      toast.success("Laudo removido.");
    },
    onError: () => toast.error("Erro ao remover o laudo. Tente novamente."),
  });

  const anexarMedicacao = useMutation({
    mutationFn: (dados: MedicacaoRequest) => alunoApi.anexarMedicacao(alunoId, dados),
    onSuccess: () => {
      invalidar();
      toast.success("Medicação registrada!");
    },
    onError: () => toast.error("Erro ao registrar a medicação. Tente novamente."),
  });

  const atualizarMedicacao = useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: MedicacaoRequest }) =>
      alunoApi.atualizarMedicacao(alunoId, id, dados),
    onSuccess: () => {
      invalidar();
      toast.success("Medicação atualizada!");
    },
    onError: () => toast.error("Erro ao atualizar a medicação. Tente novamente."),
  });

  const desativarMedicacao = useMutation({
    mutationFn: (medicacaoId: number) => alunoApi.desativarMedicacao(alunoId, medicacaoId),
    onSuccess: () => {
      invalidar();
      toast.success("Medicação desativada.");
    },
    onError: () => toast.error("Erro ao desativar a medicação. Tente novamente."),
  });

  return {
    salvarDadosClinicos,
    anexarLaudo,
    removerLaudo,
    anexarMedicacao,
    atualizarMedicacao,
    desativarMedicacao,
  };
}
