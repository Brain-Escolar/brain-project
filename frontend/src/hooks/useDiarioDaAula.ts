"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { aulaApi, conteudoApi } from "@/services/api";
import { ConteudoResponse } from "@/services/domains/conteudo";
import { TarefaAulaResponse } from "@/services/domains/aula/response";
import { useQuery } from "@tanstack/react-query";

export interface DiarioExistente {
  conteudo: ConteudoResponse | null;
  tarefa: TarefaAulaResponse | null;
}

export function useDiarioDaAula(aulaId: string, data: string) {
  const { data: conteudo, isLoading: loadingConteudo } = useQuery<ConteudoResponse | null>({
    queryKey: QUERY_KEYS.conteudos.porAulaData(aulaId, data),
    queryFn: () =>
      conteudoApi.buscarPorAulaData(Number(aulaId), data).catch((err) => {
        if (err?.status === 404 || err?.response?.status === 404) return null;
        throw err;
      }),
    enabled: !!aulaId && !!data,
    retry: false,
  });

  const { data: tarefa, isLoading: loadingTarefa } = useQuery<TarefaAulaResponse | null>({
    queryKey: QUERY_KEYS.aulas.tarefaDiario(aulaId, data),
    queryFn: () =>
      aulaApi.getTarefaDiario(aulaId, data).catch((err) => {
        if (err?.status === 404 || err?.response?.status === 404) return null;
        throw err;
      }),
    enabled: !!aulaId && !!data,
    retry: false,
  });

  return {
    diario: {
      conteudo: conteudo ?? null,
      tarefa: tarefa ?? null,
    } as DiarioExistente,
    carregando: loadingConteudo || loadingTarefa,
  };
}
