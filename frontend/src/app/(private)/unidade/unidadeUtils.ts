import { UnidadeFormData } from "@/app/(private)/unidade/schema";
import { UnidadePostRequest, UnidadePutRequest } from "@/services/domains/unidade/request";
import { UnidadeResponse } from "@/services/domains/unidade/response";

export function mapFormDataToUnidadePostRequest(formData: UnidadeFormData): UnidadePostRequest {
  return {
    nome: formData.nome,
  };
}

export function mapFormDataToUnidadePutRequest(
  formData: UnidadeFormData,
  id: number,
): UnidadePutRequest {
  return {
    id,
    nome: formData.nome,
  };
}

/**
 * Mapeia os dados da unidade da API para o formato do formulário
 */
export function mapUnidadeResponseToFormData(unidade: UnidadeResponse): UnidadeFormData {
  return {
    nome: unidade.nome || "",
  };
}
