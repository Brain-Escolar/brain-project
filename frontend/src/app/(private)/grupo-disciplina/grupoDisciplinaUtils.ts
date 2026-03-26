import { GrupoDisciplinaFormData } from "@/app/(private)/grupo-disciplina/schema";
import {
  GrupoDisciplinaPostRequest,
  GrupoDisciplinaPutRequest,
} from "@/services/domains/grupo-disciplina/request";
import { GrupoDisciplinaDetalheResponse } from "@/services/domains/grupo-disciplina/response";

export function mapFormDataToGrupoDisciplinaPostRequest(
  formData: GrupoDisciplinaFormData,
): GrupoDisciplinaPostRequest {
  return {
    nome: formData.nome,
    area: formData.area,
  };
}

export function mapFormDataToGrupoDisciplinaPutRequest(
  formData: GrupoDisciplinaFormData,
  id: string,
): GrupoDisciplinaPutRequest {
  return {
    id,
    nome: formData.nome,
    area: formData.area,
  };
}

/**
 * Mapeia os dados do grupo disciplina da API para o formato do formulário
 */
export function mapGrupoDisciplinaResponseToFormData(
  grupoDisciplina: GrupoDisciplinaDetalheResponse,
): GrupoDisciplinaFormData {
  return {
    nome: grupoDisciplina.nome || "",
    area: grupoDisciplina.area || "",
  };
}
