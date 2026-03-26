"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { alertaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import { AlertaPostRequest, AlertaPutRequest } from "@/services/domains/alerta/request";

/**
 * Hook para mutações relacionadas aos alertas
 * Inclui create, update e outras operações que modificam dados
 */
export function useAlertaMutations() {
  const queryClient = useQueryClient();

  // Mutation para criar alerta
  const createAlerta = useMutation({
    mutationFn: (data: AlertaPostRequest) => alertaApi.criarAlerta(data),
    onSuccess: () => {
      // Invalida e refetch a lista de alertas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alertas.all });
      toast.success("Alerta criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar alerta:", error);
      toast.error("Ocorreu um erro ao criar o alerta no servidor. Tente novamente.");
    },
  });

  // Mutation para deletar alerta
  const deleteAlerta = useMutation({
    mutationFn: (id: string) => alertaApi.deleteAlerta(id),
    onSuccess: () => {
      // Invalida e refetch a lista de alertas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alertas.all });
      toast.success("Alerta excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir alerta:", error);
      toast.error("Ocorreu um erro ao excluir o alerta. Tente novamente.");
    },
  });

  // Mutation para atualizar alerta
  const updateAlerta = useMutation({
    mutationFn: (data: AlertaPutRequest) => alertaApi.atualizarAlerta(data),
    onSuccess: () => {
      // Invalida e refetch a lista de alertas e o detalhe
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alertas.all });
      toast.success("Alerta atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar alerta:", error);
      toast.error("Ocorreu um erro ao atualizar o alerta. Tente novamente.");
    },
  });

  return {
    createAlerta,
    deleteAlerta,
    updateAlerta,
  };
}
