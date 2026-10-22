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
