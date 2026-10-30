"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { contratoApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

/**
 * O contrato com o carnê.
 *
 * Sem staleTime curto como nas simulações: contrato efetivado não expira sozinho
 * — ao contrário da proposta, que segura orçamento de bolsa com prazo. O que muda
 * aqui é baixa de parcela, e quem dá baixa invalida a chave.
 */
export function useContrato(contratoId: number | null) {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.contratos.detail(contratoId ?? 0),
    queryFn: () => contratoApi.getPorId(contratoId!),
    enabled: contratoId !== null,
    refetchOnWindowFocus: false,
    meta: { errorMessage: "Erro ao carregar o contrato." },
  });

  return { contrato: data ?? null, loading: isLoading };
}

/**
 * Os contratos de um aluno. Base da tela de baixa: a secretaria acha o aluno,
 * abre o carnê e dá baixa na parcela que o pai está pagando — venceu ou não.
 */
export function useContratosDoAluno(alunoId: number | null, anoLetivo?: number) {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.contratos.doAluno(alunoId ?? 0, anoLetivo),
    queryFn: () => contratoApi.getDoAluno(alunoId!, anoLetivo),
    enabled: alunoId !== null,
    refetchOnWindowFocus: false,
    meta: { errorMessage: "Erro ao carregar os contratos deste aluno." },
  });

  return { contratos: data ?? [], loading: isLoading };
}

/** Inclui rescindidos: a matrícula refeita tem mais de um contrato. */
export function useContratosDaMatricula(matriculaId: number | null) {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.contratos.daMatricula(matriculaId ?? 0),
    queryFn: () => contratoApi.getDaMatricula(matriculaId!),
    enabled: matriculaId !== null,
    refetchOnWindowFocus: false,
    meta: { errorMessage: "Erro ao carregar os contratos desta matrícula." },
  });

  return { contratos: data ?? [], loading: isLoading };
}
