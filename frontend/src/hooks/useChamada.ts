"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { chamadaApi } from "@/services/api";
import { PresencaAlunoRequest } from "@/services/domains/chamada";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSalvarChamada(aulaId: string, data: string) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (presencas: PresencaAlunoRequest[]) =>
      chamadaApi.cadastrar({ aulaId: Number(aulaId), data, presencas }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.chamadas.porAulaData(aulaId, data),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.aulas.alunos(aulaId),
      });
    },
  });

  return { salvarChamada: mutateAsync, salvando: isPending };
}
