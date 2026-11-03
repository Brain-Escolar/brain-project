"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { bolsaApi } from "@/services/api";
import { AprovacaoBolsaRequest } from "@/services/domains/bolsa";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "react-toastify";

function mensagemDoBackend(erro: unknown, fallback: string): string {
  const resposta = (erro as AxiosError<{ message?: string; erro?: string }>)?.response?.data;
  return resposta?.message ?? resposta?.erro ?? fallback;
}

/**
 * A fila de aprovação de bolsa.
 *
 * `staleTime` curto e refetch ao focar a janela porque a fila é compartilhada:
 * duas pessoas com alçada podem estar olhando, e aprovar algo que o outro já
 * decidiu dá erro — melhor a lista encolher sozinha do que o clique falhar.
 */
export function usePendentesDeAprovacao() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.bolsa.pendentes(),
    queryFn: () => bolsaApi.getPendentes(),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    meta: { errorMessage: "Erro ao carregar a fila de aprovação." },
  });

  return { pendentes: data ?? [], loading: isLoading };
}

export function useAprovacaoBolsaMutations() {
  const queryClient = useQueryClient();

  function invalidar() {
    // Decidir consome (ou devolve) envelope: o teto que outra tela mostra mudou.
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bolsa.all });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.simulacoes.all });
  }

  const aprovar = useMutation({
    mutationFn: ({ concessaoId, decisao }: { concessaoId: number; decisao: AprovacaoBolsaRequest }) =>
      bolsaApi.aprovar(concessaoId, decisao),
    onSuccess: (concessao) => {
      invalidar();
      const cortou =
        concessao.percentualPedido != null && concessao.percentual < concessao.percentualPedido;
      toast.success(
        cortou
          ? `Aprovado ${concessao.percentual}% — abaixo dos ${concessao.percentualPedido}% pedidos.`
          : `Bolsa de ${concessao.percentual}% aprovada.`,
      );
    },
    onError: (erro) => toast.error(mensagemDoBackend(erro, "Não foi possível aprovar.")),
  });

  const rejeitar = useMutation({
    mutationFn: ({ concessaoId, motivo }: { concessaoId: number; motivo: string }) =>
      bolsaApi.rejeitar(concessaoId, { motivo }),
    onSuccess: () => {
      invalidar();
      toast.success("Pedido recusado. O motivo ficou registrado.");
    },
    onError: (erro) => toast.error(mensagemDoBackend(erro, "Não foi possível recusar.")),
  });

  return { aprovar, rejeitar };
}
