"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { chamadaApi } from "@/services/api";
import { ChamadaResponse, PresencaAlunoRequest } from "@/services/domains/chamada";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const EMPTY_CHAMADAS: ChamadaResponse[] = [];

export function useChamadaDaAula(aulaId: string, data: string) {
  const { data: chamadas, isLoading } = useQuery({
    queryKey: QUERY_KEYS.chamadas.porAulaData(aulaId, data),
    queryFn: () => chamadaApi.buscarPorAulaData(Number(aulaId), data),
    enabled: !!aulaId && !!data,
  });

  return { chamadas: chamadas ?? EMPTY_CHAMADAS, carregando: isLoading };
}

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

export function useAtualizarChamada(aulaId: string, data: string) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (presencas: PresencaAlunoRequest[]) =>
      chamadaApi.atualizarLote(Number(aulaId), data, { presencas }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.chamadas.porAulaData(aulaId, data),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.aulas.alunos(aulaId),
      });
    },
  });

  return { atualizarChamada: mutateAsync, atualizando: isPending };
}
