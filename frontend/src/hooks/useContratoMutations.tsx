"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { contratoApi } from "@/services/api";
import { EfetivarMatriculaRequest } from "@/services/domains/contrato";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "react-toastify";

/**
 * O backend recusa a efetivação com mensagem dizendo O QUE barrou — proposta
 * expirada, aluno sem responsável financeiro, matrícula já efetivada para o ano.
 * Essa é a parte útil do erro e tem de chegar ao funcionário: um toast genérico
 * deixaria ele clicando de novo sem saber o que corrigir.
 */
function mensagemDoBackend(erro: unknown, fallback: string): string {
  const resposta = (erro as AxiosError<{ message?: string; erro?: string }>)?.response?.data;
  return resposta?.message ?? resposta?.erro ?? fallback;
}

export function useContratoMutations(processoMatriculaId?: number) {
  const queryClient = useQueryClient();

  const efetivar = useMutation({
    mutationFn: (dados: EfetivarMatriculaRequest) => contratoApi.efetivar(dados),
    onSuccess: (contrato) => {
      /**
       * Invalida bolsa inteira porque efetivar CONSOME envelope: a reserva da
       * proposta virou compromisso, e o teto que outra tela está mostrando acabou
       * de mudar. E invalida as simulações porque a proposta virou CONVERTIDA e
       * ganhou contratoId.
       */
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bolsa.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.simulacoes.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contratos.all });
      if (processoMatriculaId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.simulacoes.doProcesso(processoMatriculaId),
        });
      }

      /**
       * O carnê que não fecha com o contrato é erro grave e silencioso: a família
       * seria cobrada a mais ou a menos do que assinou, e ninguém notaria até
       * alguém somar os boletos na mão. O backend devolve essa conta já feita;
       * aqui ela não pode passar como sucesso comum.
       */
      if (!contrato.carneFecha) {
        toast.error(
          `Contrato ${contrato.numero} criado, mas a soma das parcelas não fecha com o valor ` +
            "contratado. Não entregue este carnê à família antes de conferir.",
        );
        return;
      }

      toast.success(
        `Matrícula efetivada. Contrato ${contrato.numero} com ${contrato.titulos.length} parcelas.`,
      );
    },
    onError: (erro) => {
      toast.error(mensagemDoBackend(erro, "Não foi possível efetivar a matrícula."));
    },
  });

  return { efetivar };
}
