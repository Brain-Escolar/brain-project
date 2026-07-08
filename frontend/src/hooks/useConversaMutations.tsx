"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { conversaApi } from "@/services/api";
import { ConversaCreateRequest, ConversaResponse, MensagemCreateRequest } from "@/services/domains/conversa/response";
import { IBrainResult } from "@/services/commoResponse";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";

export function useConversaMutations() {
  const queryClient = useQueryClient();

  const criarConversa = useMutation({
    mutationFn: (data: ConversaCreateRequest) => conversaApi.criar(data),
    onSuccess: (novaConversa) => {
      queryClient.setQueryData(
        QUERY_KEYS.conversas.remetente(0),
        (old: IBrainResult<ConversaResponse> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            content: [novaConversa, ...old.content],
            totalElements: (old.totalElements ?? 0) + 1,
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["conversas"] });
      toast.success("Mensagem enviada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao enviar mensagem.");
    },
  });

  const marcarTodasComoLida = useMutation({
    mutationFn: (conversaId: number) => conversaApi.marcarTodasComoLida(conversaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversas", "nao-lidas"] });
      queryClient.invalidateQueries({ queryKey: ["conversas", "remetente"] });
      queryClient.invalidateQueries({ queryKey: ["conversas", "destinatario"] });
    },
  });

  const enviarMensagem = useMutation({
    mutationFn: ({ conversaId, data }: { conversaId: number; data: MensagemCreateRequest }) =>
      conversaApi.enviarMensagem(conversaId, data),
    onSuccess: (_, { conversaId }) => {
      queryClient.invalidateQueries({ queryKey: ["conversas", "mensagens", conversaId] });
    },
    onError: () => {
      toast.error("Erro ao enviar mensagem.");
    },
  });

  const fecharConversa = useMutation({
    mutationFn: (id: number) => conversaApi.fechar(id),
    onSuccess: (conversaFechada) => {
      queryClient.setQueryData(
        QUERY_KEYS.conversas.remetente(0),
        (old: IBrainResult<ConversaResponse> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.map((c) =>
              c.id === conversaFechada.id ? conversaFechada : c,
            ),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["conversas"] });
      toast.success("Conversa encerrada.");
    },
  });

  const reabrirConversa = useMutation({
    mutationFn: (id: number) => conversaApi.reabrir(id),
    onSuccess: (conversaReaberta) => {
      queryClient.setQueryData(
        QUERY_KEYS.conversas.remetente(0),
        (old: IBrainResult<ConversaResponse> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.map((c) =>
              c.id === conversaReaberta.id ? conversaReaberta : c,
            ),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["conversas"] });
      toast.success("Conversa reaberta.");
    },
    onError: () => {
      toast.error("Erro ao reabrir conversa.");
    },
  });

  return { criarConversa, enviarMensagem, fecharConversa, reabrirConversa, marcarTodasComoLida };
}
