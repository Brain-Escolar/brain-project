import { SerieFormData } from "@/app/(private)/serie/schema";
import { SeriePostRequest, SeriePutRequest } from "@/services/domains/serie/request";
import { SerieDetalheResponse } from "@/services/domains/serie/response";

export function mapFormDataToSeriePostRequest(formData: SerieFormData): SeriePostRequest {
  return {
    nome: formData.nome,
  };
}

export function mapFormDataToSeriePutRequest(formData: SerieFormData, id: string): SeriePutRequest {
  return {
    id,
    nome: formData.nome,
  };
}

/**
 * Mapeia os dados da série da API para o formato do formulário
 */
export function mapSerieResponseToFormData(serie: SerieDetalheResponse): SerieFormData {
  return {
    nome: serie.nome || "",
  };
}
