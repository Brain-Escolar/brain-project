"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { documentoApi } from "@/services/api";
import { TipoDocumento } from "@/services/domains/documento";

export function mensagemDeErro(error: unknown, padrao: string): string {
  const mensagem = error instanceof Error ? error.message.replace("HTTP Error: ", "") : "";
  return mensagem || padrao;
}

/**
 * Escritas da escola sobre documentos.
 *
 * Toda mudança invalida também alunos e CRM: aprovar ou rejeitar muda o
 * `cadastroCompleto` que aparece nas listagens de Matrículas e no funil.
 */
export function useDocumentoMutations() {
  const queryClient = useQueryClient();

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documentos.all });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.all });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.crm.all });
  };

  const enviar = useMutation({
    mutationFn: (vars: { dadosPessoaisId: number; tipo: TipoDocumento; arquivos: File[] }) =>
      documentoApi.enviar(vars.dadosPessoaisId, vars.tipo, vars.arquivos),
    onSuccess: () => {
      invalidar();
      toast.success("Documento enviado. Ele está aguardando validação.");
    },
    onError: (error) => toast.error(mensagemDeErro(error, "Erro ao enviar o documento.")),
  });

  const aprovar = useMutation({
    mutationFn: (vars: { id: number; dataValidade?: string }) =>
      documentoApi.aprovar(vars.id, { dataValidade: vars.dataValidade || undefined }),
    onSuccess: () => {
      invalidar();
      toast.success("Documento aprovado.");
    },
    onError: (error) => toast.error(mensagemDeErro(error, "Erro ao aprovar o documento.")),
  });

  const rejeitar = useMutation({
    mutationFn: (vars: { id: number; motivo: string }) =>
      documentoApi.rejeitar(vars.id, { motivo: vars.motivo }),
    onSuccess: () => {
      invalidar();
      toast.success("Documento rejeitado. A família verá o motivo no portal.");
    },
    onError: (error) => toast.error(mensagemDeErro(error, "Erro ao rejeitar o documento.")),
  });

  const atualizarFoto = useMutation({
    mutationFn: (vars: { dadosPessoaisId: number; foto: File }) =>
      documentoApi.atualizarFoto(vars.dadosPessoaisId, vars.foto),
    onSuccess: () => {
      invalidar();
      toast.success("Foto atualizada.");
    },
    onError: (error) => toast.error(mensagemDeErro(error, "Erro ao atualizar a foto.")),
  });

  return { enviar, aprovar, rejeitar, atualizarFoto };
}
