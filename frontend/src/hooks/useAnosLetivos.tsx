"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { anoLetivoApi } from "@/services/api";
import { PeriodosLetivosRequest } from "@/services/domains/ano-letivo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

/**
 * O backend explica por que recusou (ano encerrado, períodos sobrepostos, outro
 * ano ainda aberto). O httpClient embrulha o erro como "HTTP Error: <mensagem>",
 * então a mensagem útil vem daí.
 */
function mensagemDoBackend(erro: unknown, fallback: string): string {
  const mensagem = erro instanceof Error ? erro.message.replace(/^HTTP Error: /, "") : "";
  return mensagem || fallback;
}

/** Todos os anos letivos, do mais recente ao mais antigo. */
export function useAnosLetivos() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.anosLetivos.lista(),
    queryFn: () => anoLetivoApi.listar(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    anos: data ?? [],
    loading: isLoading,
    error: error ? "Não foi possível carregar os anos letivos." : null,
  };
}

export function useAnoLetivoMutations() {
  const queryClient = useQueryClient();

  /**
   * Mudar o ano corrente ou o calendário mexe em tudo que é filtrado por ano
   * ou por período: invalida tudo, não só a lista de anos.
   */
  function invalidar() {
    queryClient.invalidateQueries();
  }

  const criar = useMutation({
    mutationFn: (ano: number) => anoLetivoApi.criar(ano),
    onSuccess: (ano) => {
      invalidar();
      toast.success(`Ano letivo ${ano.ano} criado em planejamento.`);
    },
    onError: (erro) => toast.error(mensagemDoBackend(erro, "Não foi possível criar o ano letivo.")),
  });

  const salvarPeriodos = useMutation({
    mutationFn: ({ ano, dados }: { ano: number; dados: PeriodosLetivosRequest }) =>
      anoLetivoApi.salvarPeriodos(ano, dados),
    onSuccess: (ano) => {
      invalidar();
      toast.success(`Calendário de ${ano.ano} salvo.`);
    },
    onError: (erro) => toast.error(mensagemDoBackend(erro, "Não foi possível salvar os períodos.")),
  });

  const abrir = useMutation({
    mutationFn: (ano: number) => anoLetivoApi.abrir(ano),
    onSuccess: (ano) => {
      invalidar();
      toast.success(`${ano.ano} agora é o ano letivo corrente.`);
    },
    onError: (erro) => toast.error(mensagemDoBackend(erro, "Não foi possível abrir o ano letivo.")),
  });

  const fecharPeriodo = useMutation({
    mutationFn: ({ ano, sequencia }: { ano: number; sequencia: number }) =>
      anoLetivoApi.fecharPeriodo(ano, sequencia),
    onSuccess: () => {
      invalidar();
      toast.success("Período fechado. Notas e chamadas dele não podem mais ser alteradas.");
    },
    onError: (erro) => toast.error(mensagemDoBackend(erro, "Não foi possível fechar o período.")),
  });

  const reabrirPeriodo = useMutation({
    mutationFn: ({ ano, sequencia }: { ano: number; sequencia: number }) =>
      anoLetivoApi.reabrirPeriodo(ano, sequencia),
    onSuccess: () => {
      invalidar();
      toast.success("Período reaberto para correções.");
    },
    onError: (erro) => toast.error(mensagemDoBackend(erro, "Não foi possível reabrir o período.")),
  });

  return { criar, salvarPeriodos, abrir, fecharPeriodo, reabrirPeriodo };
}
