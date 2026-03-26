"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { horarioApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import { HorarioPostRequest, HorarioPutRequest } from "@/services/domains/horario/request";

/**
 * Hook para mutações relacionadas aos horários
 * Inclui create, update e outras operações que modificam dados
 */
export function useHorarioMutations() {
  const queryClient = useQueryClient();

  // Mutation para criar horário
  const createHorario = useMutation({
    mutationFn: (data: HorarioPostRequest) => horarioApi.criarHorario(data),
    onSuccess: () => {
      // Invalida e refetch a lista de horários e aulas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.horarios.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aulas.all });
      toast.success("Horário criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar horário:", error);
      toast.error("Ocorreu um erro ao criar o horário no servidor. Tente novamente.");
    },
  });

  // Mutation para deletar horário
  const deleteHorario = useMutation({
    mutationFn: (id: string) => horarioApi.deleteHorario(id),
    onSuccess: () => {
      // Invalida e refetch a lista de horários e aulas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.horarios.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aulas.all });
      toast.success("Horário excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir horário:", error);
      toast.error("Ocorreu um erro ao excluir o horário. Tente novamente.");
    },
  });

  // Mutation para atualizar horário
  const updateHorario = useMutation({
    mutationFn: (data: HorarioPutRequest) => horarioApi.atualizarHorario(data),
    onSuccess: () => {
      // Invalida e refetch a lista de horários e aulas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.horarios.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aulas.all });
      toast.success("Horário atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar horário:", error);
      toast.error("Ocorreu um erro ao atualizar o horário. Tente novamente.");
    },
  });

  return {
    createHorario,
    deleteHorario,
    updateHorario,
  };
}
