"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { anotacaoApi } from "@/services/api";
import { CadastroAnotacaoLoteRequest } from "@/services/domains/anotacao";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCriarAnotacao(aulaId: string, data: string) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (request: CadastroAnotacaoLoteRequest) => anotacaoApi.cadastrarLote(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.aulas.anotacoes(aulaId, data),
      });
    },
  });

  return { criarAnotacao: mutateAsync, salvando: isPending };
}
