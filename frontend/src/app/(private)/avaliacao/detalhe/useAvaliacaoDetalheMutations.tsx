"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import { SalvarNotasAvaliacaoRequest } from "@/services/domains/avaliacao/request";

/**
 * Hook para mutações da tela de detalhe de avaliação.
 *
 * TODO: Substituir o mock pela chamada real quando o endpoint estiver disponível:
 *   mutationFn: (data) => avaliacaoApi.salvarNotasAvaliacao(data)
 * E remover o arquivo src/mocks/avaliacaoDetalhe.ts
 */
export function useAvaliacaoDetalheMutations() {
  const queryClient = useQueryClient();

  const salvarNotas = useMutation({
    mutationFn: async (data: SalvarNotasAvaliacaoRequest) => {
      // TODO: Substituir pelo endpoint real: return avaliacaoApi.salvarNotasAvaliacao(data);
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("Mock: notas salvas", data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.avaliacaoDetalhe.detail(variables.avaliacaoId),
      });
      toast.success("Notas salvas com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao salvar notas:", error);
      toast.error("Ocorreu um erro ao salvar as notas. Tente novamente.");
    },
  });

  return { salvarNotas };
}
