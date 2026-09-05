"use client";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { crmApi } from "@/services/api";
import {
  AtualizacaoFunilEstagioRequest,
  CadastroFunilEstagioRequest,
  CadastroInteracaoRequest,
  CadastroLeadCrmRequest,
  MarcarPerdidoRequest,
  ReatribuirRequest,
} from "@/services/domains/crm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

/**
 * Reúne as mutações do CRM de matrículas. Toda mutação invalida as listas de
 * processos, a carga da equipe e (quando aplicável) o detalhe do processo afetado,
 * para que Meu dia / Funil / Fila fiquem consistentes entre si.
 */
export function useCrmMutations(processoId?: string | number) {
  const queryClient = useQueryClient();

  function invalidarListas() {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.crm.all });
  }

  const criarLead = useMutation({
    mutationFn: (dados: CadastroLeadCrmRequest) => crmApi.criarLead(dados),
    onSuccess: () => {
      invalidarListas();
      toast.success("Lead criado com sucesso!");
    },
    onError: () => toast.error("Erro ao criar lead. Tente novamente."),
  });

  const registrarInteracao = useMutation({
    mutationFn: (dados: CadastroInteracaoRequest) => {
      if (!processoId) throw new Error("processoId é obrigatório");
      return crmApi.registrarInteracao(processoId, dados);
    },
    onSuccess: () => {
      invalidarListas();
      toast.success("Interação registrada com sucesso!");
    },
    onError: () => toast.error("Erro ao registrar interação. Tente novamente."),
  });

  const avancarEstagio = useMutation({
    mutationFn: () => {
      if (!processoId) throw new Error("processoId é obrigatório");
      return crmApi.avancarEstagio(processoId);
    },
    onSuccess: () => {
      invalidarListas();
      toast.success("Processo avançou de estágio!");
    },
    onError: () => toast.error("Erro ao avançar estágio. Tente novamente."),
  });

  const marcarPerdido = useMutation({
    mutationFn: (dados: MarcarPerdidoRequest) => {
      if (!processoId) throw new Error("processoId é obrigatório");
      return crmApi.marcarPerdido(processoId, dados);
    },
    onSuccess: () => {
      invalidarListas();
      toast.success("Processo marcado como perdido.");
    },
    onError: () => toast.error("Erro ao marcar como perdido. Tente novamente."),
  });

  const reatribuir = useMutation({
    mutationFn: (dados: ReatribuirRequest) => {
      if (!processoId) throw new Error("processoId é obrigatório");
      return crmApi.reatribuir(processoId, dados);
    },
    onSuccess: () => {
      invalidarListas();
      toast.success("Processo reatribuído com sucesso!");
    },
    onError: () => toast.error("Erro ao reatribuir processo. Tente novamente."),
  });

  const atribuirAMim = useMutation({
    mutationFn: (id: string | number) => crmApi.atribuirAMim(id),
    onSuccess: () => {
      invalidarListas();
      toast.success("Lead atribuído a você!");
    },
    onError: () => toast.error("Erro ao atribuir lead. Tente novamente."),
  });

  const distribuirFila = useMutation({
    mutationFn: () => crmApi.distribuirFila(),
    onSuccess: () => {
      invalidarListas();
      toast.success("Fila distribuída entre a equipe!");
    },
    onError: () => toast.error("Erro ao distribuir a fila. Tente novamente."),
  });

  const criarEstagio = useMutation({
    mutationFn: (dados: CadastroFunilEstagioRequest) => crmApi.criarEstagio(dados),
    onSuccess: () => {
      invalidarListas();
      toast.success("Estágio criado com sucesso!");
    },
    onError: () => toast.error("Erro ao criar estágio. Tente novamente."),
  });

  const atualizarEstagio = useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: AtualizacaoFunilEstagioRequest }) =>
      crmApi.atualizarEstagio(id, dados),
    onSuccess: () => {
      invalidarListas();
      toast.success("Estágio atualizado com sucesso!");
    },
    onError: () => toast.error("Erro ao atualizar estágio. Tente novamente."),
  });

  const moverEstagio = useMutation({
    mutationFn: ({ id, direcao }: { id: number; direcao: "CIMA" | "BAIXO" }) =>
      crmApi.moverEstagio(id, direcao),
    onSuccess: () => invalidarListas(),
    onError: () => toast.error("Erro ao reordenar estágio. Tente novamente."),
  });

  return {
    criarLead,
    registrarInteracao,
    avancarEstagio,
    marcarPerdido,
    reatribuir,
    atribuirAMim,
    distribuirFila,
    criarEstagio,
    atualizarEstagio,
    moverEstagio,
  };
}
