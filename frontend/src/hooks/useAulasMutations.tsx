"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { aulaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";

/**
 * Hook para mutações relacionadas às aulas
 * Inclui create, update e outras operações que modificam dados
 */
export function useAulasMutations() {
  const queryClient = useQueryClient();

  // Mutation para criar aula
  const createAula = useMutation({
    mutationFn: aulaApi.criarAula,
    onSuccess: () => {
      // Invalida e refetch a lista de aulas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aulas.all });
      toast.success("Aula criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar aula:", error);
      toast.error("Erro ao criar aula. Tente novamente.");
    },
  });

  // Mutation para atualizar aula
  const updateAula = useMutation({
    mutationFn: aulaApi.atualizarAula,
    onSuccess: () => {
      // Invalida e refetch a lista de aulas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aulas.all });
      toast.success("Aula atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar aula:", error);
      toast.error("Erro ao atualizar aula. Tente novamente.");
    },
  });

  return {
    createAula,
    updateAula,
  };
}
