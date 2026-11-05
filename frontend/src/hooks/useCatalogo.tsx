"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { produtoApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

/**
 * O catálogo de produtos da escola.
 *
 * É o começo da cadeia: sem produto com natureza e sem preço vigente não há
 * proposta, sem proposta não há contrato, sem contrato não há carnê. Até esta
 * tela existir, isso só se fazia por SQL na mão.
 */
export function useProdutos() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.produtos.lista(),
    queryFn: () => produtoApi.listar({ size: 200 }),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    meta: { errorMessage: "Erro ao carregar o catálogo de produtos." },
  });

  return { produtos: data?.content ?? [], loading: isLoading };
}

export function useProduto(produtoId: number | null) {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.produtos.detalhe(produtoId ?? 0),
    queryFn: () => produtoApi.detalhar(produtoId!),
    enabled: produtoId !== null,
    refetchOnWindowFocus: false,
    meta: { errorMessage: "Erro ao carregar o produto." },
  });

  return { produto: data ?? null, loading: isLoading };
}

/**
 * Todos os preços de uma modalidade — vigentes, encerrados e futuros.
 *
 * O histórico inteiro de propósito: esta tabela é o histórico de preço, não há
 * auditoria paralela. Esconder as linhas antigas esconderia a única resposta
 * para "quanto custava quando aquele contrato foi assinado".
 */
export function usePrecos(modalidadeId: number | null) {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.produtos.precos(modalidadeId ?? 0),
    queryFn: () => produtoApi.listarPrecos(modalidadeId!),
    enabled: modalidadeId !== null,
    refetchOnWindowFocus: false,
    meta: { errorMessage: "Erro ao carregar os preços." },
  });

  return { precos: data ?? [], loading: isLoading };
}
