"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { responsavelPortalApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

/**
 * O carnê do responsável logado.
 *
 * O backend só responde 200 para quem tem a flag `financeiro` — nem todo
 * responsável vinculado é o responsável financeiro. Um 403 aqui é resposta
 * legítima, não falha, e a tela trata como "sem acesso".
 *
 * `retry: false` pelo mesmo motivo: repetir um 403 três vezes não muda a
 * resposta, só atrasa a tela.
 */
export function useCarneResponsavel(anoLetivo?: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.responsavel.carne(anoLetivo),
    queryFn: () => responsavelPortalApi.getCarne(anoLetivo),
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    carne: data ?? null,
    loading: isLoading,
    semAcesso: error != null,
  };
}
