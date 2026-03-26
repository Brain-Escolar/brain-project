"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { aulaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import { AulaPostRequest, AulaPutRequest } from "@/services/domains/aula/request";

/**
 * Hook para mutações relacionadas às aulas
 * Inclui create, update e outras operações que modificam dados
 */
export function useAulaMutations() {
  const queryClient = useQueryClient();

  // Mutation para criar aula
  const createAula = useMutation({
    mutationFn: (data: AulaPostRequest) => aulaApi.criarAula(data),
    onSuccess: () => {
      // Invalida e refetch a lista de aulas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aulas.all });
      toast.success("Aula criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar aula:", error);
      toast.error("Ocorreu um erro ao criar a aula no servidor. Tente novamente.");
    },
  });

  // Mutation para deletar aula
  const deleteAula = useMutation({
    mutationFn: (id: string) => aulaApi.deleteAula(id),
    onSuccess: () => {
      // Invalida e refetch a lista de aulas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aulas.all });
      toast.success("Aula excluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir aula:", error);
      toast.error("Ocorreu um erro ao excluir a aula. Tente novamente.");
    },
  });

  // Mutation para atualizar aula
  const updateAula = useMutation({
    mutationFn: (data: AulaPutRequest) => aulaApi.atualizarAula(data),
    onSuccess: () => {
      // Invalida e refetch a lista de aulas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aulas.all });
      toast.success("Aula atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar aula:", error);
      toast.error("Ocorreu um erro ao atualizar a aula. Tente novamente.");
    },
  });

  return {
    createAula,
    deleteAula,
    updateAula,
  };
}
