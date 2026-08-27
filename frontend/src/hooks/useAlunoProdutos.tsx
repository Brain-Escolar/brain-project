"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { produtoApi } from "@/services/api";
import { AlunoProdutoResponse } from "@/services/domains/produto/response";
import { useQuery } from "@tanstack/react-query";

interface UseAlunoProdutosReturn {
  produtos: AlunoProdutoResponse[];
  loading: boolean;
  error: string | null;
}

export function useAlunoProdutos(alunoId: string | null, enabled = true): UseAlunoProdutosReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.alunos.produtos(alunoId || ""),
    queryFn: () => produtoApi.listarComprasPorAluno(alunoId!),
    enabled: !!alunoId && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    produtos: data ?? [],
    loading: isLoading,
    error: error ? "Erro ao carregar produtos e contratos." : null,
  };
}
