"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fichaMedicaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import {
  FichaMedicaPostRequest,
  FichaMedicaPutRequest,
} from "@/services/domains/ficha-medica/request";

/**
 * Hook para mutações relacionadas às fichas médicas
 * Inclui create, update e outras operações que modificam dados
 */
export function useFichaMedicaMutations() {
  const queryClient = useQueryClient();

  // Mutation para criar ficha médica
  const createFichaMedica = useMutation({
    mutationFn: (data: FichaMedicaPostRequest) => fichaMedicaApi.criarFichaMedica(data),
    onSuccess: () => {
      // Invalida e refetch a lista de fichas médicas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fichasMedicas.all });
      toast.success("Ficha médica criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar ficha médica:", error);
      toast.error("Ocorreu um erro ao criar a ficha médica no servidor. Tente novamente.");
    },
  });

  // Mutation para deletar ficha médica
  const deleteFichaMedica = useMutation({
    mutationFn: (id: string) => fichaMedicaApi.deleteFichaMedica(id),
    onSuccess: () => {
      // Invalida e refetch a lista de fichas médicas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fichasMedicas.all });
      toast.success("Ficha médica excluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir ficha médica:", error);
      toast.error("Ocorreu um erro ao excluir a ficha médica. Tente novamente.");
    },
  });

  // Mutation para atualizar ficha médica
  const updateFichaMedica = useMutation({
    mutationFn: (data: FichaMedicaPutRequest) => fichaMedicaApi.atualizarFichaMedica(data),
    onSuccess: () => {
      // Invalida e refetch a lista de fichas médicas e o detalhe
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fichasMedicas.all });
      toast.success("Ficha médica atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar ficha médica:", error);
      toast.error("Ocorreu um erro ao atualizar a ficha médica. Tente novamente.");
    },
  });

  return {
    createFichaMedica,
    deleteFichaMedica,
    updateFichaMedica,
  };
}
