"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { comunicadoApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  ComunicadoCreateRequest,
  ComunicadoUpdateRequest,
} from "@/services/domains/comunicado/response";
import { toast } from "react-toastify";

export function useComunicadoMutations() {
  const queryClient = useQueryClient();

  const createComunicado = useMutation({
    mutationFn: ({
      data,
      imagem,
      anexo,
    }: {
      data: ComunicadoCreateRequest;
      imagem?: File;
      anexo?: File;
    }) => comunicadoApi.criarComunicado(data, imagem, anexo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.comunicados.all });
      toast.success("Comunicado criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar comunicado:", error);
      toast.error("Erro ao criar comunicado. Tente novamente.");
    },
  });

  const updateComunicado = useMutation({
    mutationFn: ({
      id,
      imagem,
      anexo,
      ...data
    }: ComunicadoUpdateRequest & { id: number; imagem?: File; anexo?: File }) =>
      comunicadoApi.atualizarComunicado(id, data, imagem, anexo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.comunicados.all });
      toast.success("Comunicado atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar comunicado:", error);
      toast.error("Erro ao atualizar comunicado. Tente novamente.");
    },
  });

  const deleteComunicado = useMutation({
    mutationFn: (id: number) => comunicadoApi.deleteComunicado(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.comunicados.all });
      toast.success("Comunicado excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir comunicado:", error);
      toast.error("Erro ao excluir comunicado. Tente novamente.");
    },
  });

  return {
    createComunicado,
    updateComunicado,
    deleteComunicado,
  };
}
