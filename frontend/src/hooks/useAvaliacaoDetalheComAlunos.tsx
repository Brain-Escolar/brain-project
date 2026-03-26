"use client";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { mockAvaliacaoDetalhe } from "@/mocks/avaliacaoDetalhe";

/**
 * Hook para buscar os detalhes de uma avaliação com a lista de alunos e notas.
 *
 * TODO: Substituir o mock pela chamada real quando o endpoint estiver disponível:
 *   return avaliacaoApi.getAvaliacaoDetalheComAlunos(id);
 * E remover o arquivo src/mocks/avaliacaoDetalhe.ts
 */
export function useAvaliacaoDetalheComAlunos(id: string) {
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.avaliacaoDetalhe.detail(id),
    queryFn: async () => {
      // TODO: Substituir pelo endpoint real: avaliacaoApi.getAvaliacaoDetalheComAlunos(id)
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockAvaliacaoDetalhe;
    },
    enabled: !!id,
  });

  return {
    data,
    loading,
    error,
    refetch,
  };
}
