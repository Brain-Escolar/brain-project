"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { tarefaApi } from "@/services/api";
import { TarefaPostRequest } from "@/services/domains/tarefa";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCriarTarefa(aulaId: string) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ dados, arquivo }: { dados: TarefaPostRequest; arquivo?: File }) =>
      tarefaApi.criarTarefa(dados, arquivo),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.aulas.all, "tarefas", aulaId],
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.aulas.tarefasDatas(aulaId),
      });
    },
  });

  return { criarTarefa: mutateAsync, salvando: isPending };
}
