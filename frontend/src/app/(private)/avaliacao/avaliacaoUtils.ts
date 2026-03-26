import { AvaliacaoFormData } from "@/app/(private)/avaliacao/schema";
import { AvaliacaoPostRequest, AvaliacaoPutRequest } from "@/services/domains/avaliacao/request";
import { AvaliacaoDetalheResponse } from "@/services/domains/avaliacao/response";

export function mapFormDataToAvaliacaoPostRequest(
  formData: AvaliacaoFormData,
): AvaliacaoPostRequest {
  return {
    nome: formData.nome,
    disciplinaId: Number(formData.disciplinaId),
    peso: Number(formData.peso),
    conteudo: formData.conteudo,
    notaExtra: formData.notaExtra,
  };
}

export function mapFormDataToAvaliacaoPutRequest(
  formData: AvaliacaoFormData,
  id: string,
): AvaliacaoPutRequest {
  return {
    id,
    nome: formData.nome,
    disciplinaId: Number(formData.disciplinaId),
    peso: Number(formData.peso),
    conteudo: formData.conteudo,
    notaExtra: formData.notaExtra,
  };
}

/**
 * Mapeia os dados da avaliação da API para o formato do formulário
 */
export function mapAvaliacaoResponseToFormData(
  avaliacao: AvaliacaoDetalheResponse,
): AvaliacaoFormData {
  return {
    nome: avaliacao.nome || "",
    disciplinaId: avaliacao.disciplinaId?.toString() || "",
    peso: avaliacao.peso?.toString() || "",
    conteudo: avaliacao.conteudo || "",
    notaExtra: avaliacao.notaExtra || false,
  };
}
