"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { responsavelPortalApi } from "@/services/api";
import { useAlunoSelecionado } from "@/contexts/AlunoSelecionadoContext";

/**
 * Produtos e modalidades contratados para o aluno.
 *
 * O backend so responde 200 se o responsavel tiver a flag `financeiro` — nem
 * todo responsavel vinculado e o responsavel financeiro. Um 403 aqui e
 * resposta legitima, nao falha: a tela deve tratar como "sem acesso".
 */
export function useFinanceiroAluno(habilitado = true) {
  const { alunoId } = useAlunoSelecionado();

  const {
    data: contratos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.responsavel.financeiro(alunoId ?? 0),
    queryFn: () => responsavelPortalApi.getFinanceiro(alunoId as number),
    enabled: habilitado && alunoId !== null,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    contratos,
    loading: isLoading,
    error: error ? "Erro ao carregar os dados financeiros." : null,
  };
}
