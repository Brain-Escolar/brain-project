"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { anoLetivoApi } from "@/services/api";
import { PeriodosLetivosRequest, RematriculaRequest } from "@/services/domains/ano-letivo";
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

/** Prévia do encerramento do ano: só busca enquanto o diálogo está aberto. */
export function usePreviaEncerramento(ano: number | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.anosLetivos.previaEncerramento(ano ?? 0),
    queryFn: () => anoLetivoApi.previaEncerramento(ano as number),
    enabled: ano != null,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  return {
    previa: data,
    loading: isLoading,
    error: error
      ? mensagemDoBackend(error, "Não foi possível carregar a prévia do encerramento.")
      : null,
  };
}

function plural(n: number, singular: string, varios: string) {
  return `${n} ${n === 1 ? singular : varios}`;
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

  const encerrar = useMutation({
    mutationFn: (ano: number) => anoLetivoApi.encerrar(ano),
    onSuccess: (r) => {
      invalidar();
      toast.success(
        `${r.ano} encerrado: ${plural(r.concluidas, "matrícula concluída", "matrículas concluídas")} ` +
          `(${r.aprovadas} aprovados, ${r.reprovadas} reprovados, ${r.semResultado} sem resultado).`,
      );
    },
    onError: (erro) =>
      toast.error(mensagemDoBackend(erro, "Não foi possível encerrar o ano letivo.")),
  });

  const copiarTurmas = useMutation({
    mutationFn: (ano: number) => anoLetivoApi.copiarTurmas(ano),
    onSuccess: (r) => {
      invalidar();
      toast.success(
        `${plural(r.criadas, "turma criada", "turmas criadas")} em ${r.anoDestino}` +
          (r.jaExistiam ? ` (${r.jaExistiam} já existiam).` : "."),
      );
    },
    onError: (erro) => toast.error(mensagemDoBackend(erro, "Não foi possível copiar as turmas.")),
  });

  const rematricular = useMutation({
    mutationFn: ({ ano, dados }: { ano: number; dados: RematriculaRequest }) =>
      anoLetivoApi.rematricular(ano, dados),
    onSuccess: (r) => {
      invalidar();
      const pendentes = r.semDestino + r.semResultado;
      toast.success(
        `${plural(r.criadas, "pré-matrícula criada", "pré-matrículas criadas")} em ${r.anoDestino}.` +
          (r.jaMatriculados ? ` ${r.jaMatriculados} já estavam matriculados.` : "") +
          (r.concluintes ? ` ${r.concluintes} concluintes.` : "") +
          (pendentes
            ? ` ${pendentes} ficaram de fora (sem resultado ou sem série de destino).`
            : ""),
      );
    },
    onError: (erro) =>
      toast.error(mensagemDoBackend(erro, "Não foi possível rematricular os alunos.")),
  });

  return {
    criar,
    salvarPeriodos,
    abrir,
    fecharPeriodo,
    reabrirPeriodo,
    encerrar,
    copiarTurmas,
    rematricular,
  };
}
