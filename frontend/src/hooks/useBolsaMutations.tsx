"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { bolsaApi, simulacaoApi } from "@/services/api";
import { ReservarBolsaRequest } from "@/services/domains/bolsa";
import { CriarSimulacaoRequest } from "@/services/domains/simulacao";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "react-toastify";

/**
 * O backend recusa concessão com mensagem explicando QUAL limite barrou — matriz,
 * alçada ou envelope. Isso é a parte útil do erro e tem que chegar ao funcionário:
 * um toast genérico deixaria ele tentando de novo sem saber o que mudar.
 */
function mensagemDoBackend(erro: unknown, fallback: string): string {
  const resposta = (erro as AxiosError<{ message?: string; erro?: string }>)?.response?.data;
  return resposta?.message ?? resposta?.erro ?? fallback;
}

export function useBolsaMutations(processoMatriculaId?: number) {
  const queryClient = useQueryClient();

  /**
   * Invalida o teto inteiro, não só desta proposta: conceder consome envelope, e
   * envelope é compartilhado. O teto que outra tela está mostrando acabou de
   * mudar.
   */
  function invalidarDependentes(simulacaoId?: number) {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bolsa.all });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.simulacoes.all });
    if (simulacaoId) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.simulacoes.detail(simulacaoId) });
    }
    if (processoMatriculaId) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.simulacoes.doProcesso(processoMatriculaId),
      });
    }
  }

  const criarSimulacao = useMutation({
    mutationFn: (dados: CriarSimulacaoRequest) => simulacaoApi.criar(dados),
    onSuccess: (simulacao) => {
      invalidarDependentes(simulacao.id);
      toast.success("Proposta gerada a partir da tabela de preços vigente.");
    },
    onError: (erro) => {
      toast.error(
        mensagemDoBackend(
          erro,
          "Não foi possível gerar a proposta. Verifique se há preço cadastrado para esta série.",
        ),
      );
    },
  });

  const reservar = useMutation({
    mutationFn: (dados: ReservarBolsaRequest) => bolsaApi.reservar(dados),
    onSuccess: (concessao) => {
      invalidarDependentes(concessao.simulacaoId ?? undefined);
      if (concessao.excedeuEnvelope) {
        toast.warning(
          `Bolsa de ${concessao.percentual}% concedida ACIMA do orçamento, com sua aprovação registrada.`,
        );
      } else {
        toast.success(`Bolsa de ${concessao.percentual}% reservada para esta proposta.`);
      }
    },
    onError: (erro) => {
      toast.error(mensagemDoBackend(erro, "Não foi possível conceder a bolsa."));
    },
  });

  const liberar = useMutation({
    mutationFn: ({ simulacaoId, motivo }: { simulacaoId: number; motivo?: string }) =>
      bolsaApi.liberar(simulacaoId, motivo),
    onSuccess: (_, variaveis) => {
      invalidarDependentes(variaveis.simulacaoId);
      toast.success("Bolsa cancelada e orçamento devolvido.");
    },
    onError: (erro) => {
      toast.error(mensagemDoBackend(erro, "Não foi possível cancelar a bolsa."));
    },
  });

  return { criarSimulacao, reservar, liberar };
}
