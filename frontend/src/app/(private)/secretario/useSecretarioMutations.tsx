"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { secretarioApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import { SecretarioPostRequest } from "@/services/domains/secretario/request";

/**
 * Hook para mutações relacionadas aos secretários
 */
export function useSecretarioMutations() {
  const queryClient = useQueryClient();

  const createSecretario = useMutation({
    mutationFn: (data: SecretarioPostRequest) => secretarioApi.criarSecretario(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.secretarios.all });
      toast.success("Secretário criado! O link de ativação foi enviado para o e-mail cadastrado.");
    },
    onError: (error) => {
      console.error("Erro ao criar secretário:", error);
      toast.error("Ocorreu um erro ao criar o secretário no servidor. Tente novamente.");
    },
  });

  const deleteSecretario = useMutation({
    mutationFn: (id: string) => secretarioApi.deleteSecretario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.secretarios.all });
      toast.success("Secretário excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir secretário:", error);
      toast.error("Ocorreu um erro ao excluir o secretário. Tente novamente.");
    },
  });

  return {
    createSecretario,
    deleteSecretario,
  };
}
