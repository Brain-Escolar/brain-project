"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { conversaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ConversaCreateRequest, MensagemCreateRequest } from "@/services/domains/conversa/response";
import { toast } from "react-toastify";

export function useConversaMutations() {
  const queryClient = useQueryClient();

  const criarConversa = useMutation({
    mutationFn: (data: ConversaCreateRequest) => conversaApi.criar(data),
    onSuccess: () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversas"] });
      toast.success("Conversa encerrada.");
    },
  });

  return { criarConversa, enviarMensagem, fecharConversa, marcarTodasComoLida };
}
