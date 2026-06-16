"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventoApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { EventoCreateRequest, EventoUpdateRequest } from "@/services/domains/evento";
import { toast } from "react-toastify";

export function useEventoMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.eventos.all });

  const criarEvento = useMutation({
    mutationFn: (data: EventoCreateRequest) => eventoApi.cadastrar(data),
    onSuccess: () => {
      invalidate();
      toast.success("Evento criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar evento:", error);
      toast.error("Erro ao criar evento. Tente novamente.");
    },
  });

  const atualizarEvento = useMutation({
    mutationFn: ({ id, ...data }: EventoUpdateRequest & { id: number }) =>
      eventoApi.atualizar(id, data),
    onSuccess: () => {
      invalidate();
      toast.success("Evento atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar evento:", error);
      toast.error("Erro ao atualizar evento. Tente novamente.");
    },
  });

  const excluirEvento = useMutation({
    mutationFn: (id: number) => eventoApi.excluir(id),
    onSuccess: () => {
      invalidate();
      toast.success("Evento excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir evento:", error);
      toast.error("Erro ao excluir evento. Tente novamente.");
    },
  });

  return {
    criarEvento,
    atualizarEvento,
    excluirEvento,
  };
}
