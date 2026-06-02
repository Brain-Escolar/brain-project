"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { anotacaoApi } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useExcluirAnotacao(aulaId: string, data: string) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (id: number) => anotacaoApi.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.aulas.anotacoes(aulaId, data),
      });
    },
  });

  return { excluirAnotacao: mutateAsync, excluindo: isPending };
}
