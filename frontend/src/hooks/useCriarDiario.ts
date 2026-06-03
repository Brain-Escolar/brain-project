"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { conteudoApi, tarefaApi } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface CriarDiarioInput {
  conteudo: string;
  descricaoTarefa: string;
  prazo: string; // "YYYY-MM-DD"
  aulaId: number;
  turmaId: number;
  data: string; // "YYYY-MM-DD" — data da aula
  arquivo?: File;
  // ids para upsert
  conteudoId?: number;
  tarefaId?: number;
}

export function useCriarDiario(aulaId: string) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (input: CriarDiarioInput) => {
      if (input.conteudoId) {
        await conteudoApi.atualizar(input.conteudoId, { conteudo: input.conteudo });
      } else {
        await conteudoApi.criar({
          conteudo: input.conteudo,
          aulaId: input.aulaId,
          data: input.data,
        });
      }

      if (input.tarefaId) {
        await tarefaApi.atualizarTarefa({
          id: String(input.tarefaId),
          conteudo: input.descricaoTarefa,
          prazo: input.prazo,
          arquivo: input.arquivo,
        });
      } else {
        await tarefaApi.criarTarefa(
          {
            conteudo: input.descricaoTarefa,
            aulaId: input.turmaId,
            prazo: input.prazo,
            dataCriacao: input.data,
          },
          input.arquivo,
        );
      }
    },
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.conteudos.porAulaData(aulaId, input.data),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.aulas.tarefaDiario(aulaId, input.data),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.aulas.tarefas(aulaId, input.data),
      });
    },
  });

  return { criarDiario: mutateAsync, salvando: isPending };
}
