"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { simulacaoApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

/**
 * As propostas de um lead, da mais recente para a mais antiga.
 *
 * staleTime curto porque a proposta tem validade: enquanto RESERVADA ela segura
 * orçamento até `reservaExpiraEm`, e o job de madrugada libera o que venceu. Uma
 * tela aberta desde ontem mostraria reserva que já não existe.
 */
export function useSimulacoesDoProcesso(processoMatriculaId: number | null) {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.simulacoes.doProcesso(processoMatriculaId ?? 0),
    queryFn: () => simulacaoApi.getDoProcesso(processoMatriculaId!),
    enabled: processoMatriculaId !== null,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    meta: { errorMessage: "Erro ao carregar as propostas deste lead." },
  });

  return { simulacoes: data ?? [], loading: isLoading };
}

export function useSimulacoesDoAluno(alunoId: number | null) {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.simulacoes.doAluno(alunoId ?? 0),
    queryFn: () => simulacaoApi.getDoAluno(alunoId!),
    enabled: alunoId !== null,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    meta: { errorMessage: "Erro ao carregar as propostas deste aluno." },
  });

  return { simulacoes: data ?? [], loading: isLoading };
}
