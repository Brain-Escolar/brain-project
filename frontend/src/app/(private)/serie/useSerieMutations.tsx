"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { serieApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import { SeriePostRequest, SeriePutRequest } from "@/services/domains/serie/request";

/**
 * Hook para mutações relacionadas às séries
 * Inclui create, update e outras operações que modificam dados
 */
export function useSerieMutations() {
  const queryClient = useQueryClient();

  // Mutation para criar série
  const createSerie = useMutation({
    mutationFn: (data: SeriePostRequest) => serieApi.criarSerie(data),
    onSuccess: () => {
      // Invalida e refetch a lista de séries e disciplinas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.series.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.disciplinas.all });
      toast.success("Série criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar série:", error);
      toast.error("Ocorreu um erro ao criar a série no servidor. Tente novamente.");
    },
  });

  // Mutation para deletar série
  const deleteSerie = useMutation({
    mutationFn: (id: string) => serieApi.deleteSerie(id),
    onSuccess: () => {
      // Invalida e refetch a lista de séries e disciplinas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.series.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.disciplinas.all });
      toast.success("Série excluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir série:", error);
      toast.error("Ocorreu um erro ao excluir a série. Tente novamente.");
    },
  });

  // Mutation para atualizar série
  const updateSerie = useMutation({
    mutationFn: (data: SeriePutRequest) => serieApi.atualizarSerie(data),
    onSuccess: () => {
      // Invalida e refetch a lista de séries e disciplinas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.series.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.disciplinas.all });
      toast.success("Série atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar série:", error);
      toast.error("Ocorreu um erro ao atualizar a série. Tente novamente.");
    },
  });

  return {
    createSerie,
    deleteSerie,
    updateSerie,
  };
}
