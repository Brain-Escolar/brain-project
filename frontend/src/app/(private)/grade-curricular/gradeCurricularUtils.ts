import { GradeCurricularFormData } from "./schema";
import { GradeCurricularPostRequest, GradeCurricularPutRequest } from "@/services/domains/grade-curricular/request";
import { GradeCurricularDetalheResponse } from "@/services/domains/grade-curricular/response";

export function mapFormDataToGradeCurricularPostRequest(
  formData: GradeCurricularFormData,
): GradeCurricularPostRequest {
  return {
    nome: formData.nome,
    versao: formData.versao,
    disciplinaIds: formData.disciplinaIds,
  };
}

export function mapFormDataToGradeCurricularPutRequest(
  formData: GradeCurricularFormData,
  id: string,
): GradeCurricularPutRequest {
  return {
    id,
    nome: formData.nome,
    versao: formData.versao,
    disciplinaIds: formData.disciplinaIds,
  };
}

export function mapGradeCurricularResponseToFormData(
  grade: GradeCurricularDetalheResponse,
): GradeCurricularFormData {
  return {
    nome: grade.nome || "",
    versao: grade.versao || "",
    disciplinaIds: grade.disciplinas.map((d) => d.id),
  };
}
