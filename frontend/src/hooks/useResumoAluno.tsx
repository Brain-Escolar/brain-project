"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { responsavelPortalApi } from "@/services/api";
import { useAlunoSelecionado } from "@/contexts/AlunoSelecionadoContext";

/**
 * Payload unico da Home do responsavel: perfil do aluno, relatorio, proximas
 * tarefas e ocorrencias da semana numa chamada so.
 */
export function useResumoAluno() {
  const { alunoId } = useAlunoSelecionado();

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.responsavel.resumo(alunoId ?? 0),
    queryFn: () => responsavelPortalApi.getResumo(alunoId as number),
    enabled: alunoId !== null,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    resumo: data ?? null,
    loading: isLoading,
    error: error ? "Erro ao carregar os dados do aluno. Tente novamente." : null,
  };
}
