"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { materialComplementarApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { MaterialComplementarPostRequest } from "@/services/domains/material-complementar";
import { toast } from "react-toastify";

export function useMaterialComplementarMutations() {
  const queryClient = useQueryClient();

  const createMaterial = useMutation({
    mutationFn: ({ dados, arquivo }: { dados: MaterialComplementarPostRequest; arquivo?: File }) =>
      materialComplementarApi.cadastrar(dados, arquivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.materiaisComplementares.all });
      toast.success("Material adicionado com sucesso!");
    },
    onError: () => {
      toast.error("Ocorreu um erro ao adicionar o material. Tente novamente.");
    },
  });

  const deleteMaterial = useMutation({
    mutationFn: (id: number) => materialComplementarApi.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.materiaisComplementares.all });
      toast.success("Material removido com sucesso!");
    },
    onError: () => {
      toast.error("Ocorreu um erro ao remover o material. Tente novamente.");
    },
  });

  return { createMaterial, deleteMaterial };
}
