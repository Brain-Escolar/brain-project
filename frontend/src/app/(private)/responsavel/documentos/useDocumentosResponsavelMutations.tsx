"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { mensagemDeErro } from "@/hooks/useDocumentoMutations";
import { responsavelPortalApi } from "@/services/api";
import { PapelDocumentacao, TipoDocumento } from "@/services/domains/documento";

/**
 * Envios da família: documentos do aluno, os do próprio responsável e a foto.
 *
 * Invalida o checklist de documentos de TODOS os alunos do responsável — um
 * documento dele (RG, comprovante) aparece no checklist de cada filho — mas
 * nada além disso do portal.
 */
export function useDocumentosResponsavelMutations(alunoId: number | null) {
  const queryClient = useQueryClient();

  const invalidarDocumentos = () =>
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === "responsavel" && query.queryKey.includes("documentos"),
    });

  const enviar = useMutation({
    mutationFn: (vars: { papel: PapelDocumentacao; tipo: TipoDocumento; arquivos: File[] }) =>
      vars.papel === "ALUNO"
        ? responsavelPortalApi.enviarDocumentoDoAluno(alunoId as number, vars.tipo, vars.arquivos)
        : responsavelPortalApi.enviarMeuDocumento(vars.tipo, vars.arquivos),
    onSuccess: () => {
      invalidarDocumentos();
      toast.success("Documento enviado! A secretaria vai conferir e você verá o resultado aqui.");
    },
    onError: (error) =>
      toast.error(mensagemDeErro(error, "Ocorreu um erro ao enviar o documento. Tente novamente.")),
  });

  const atualizarFoto = useMutation({
    mutationFn: (foto: File) => responsavelPortalApi.atualizarFotoDoAluno(alunoId as number, foto),
    onSuccess: () => {
      invalidarDocumentos();
      toast.success("Foto atualizada!");
    },
    onError: (error) =>
      toast.error(mensagemDeErro(error, "Ocorreu um erro ao enviar a foto. Tente novamente.")),
  });

  return { enviar, atualizarFoto };
}
