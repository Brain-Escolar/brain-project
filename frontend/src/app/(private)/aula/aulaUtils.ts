import { AulaFormData } from "@/app/(private)/aula/schema";
import { AulaPostRequest, AulaPutRequest, DiaSemana } from "@/services/domains/aula/request";
import { AulaDetalheResponse } from "@/services/domains/aula/response";

export function mapFormDataToAulaPostRequest(formData: AulaFormData): AulaPostRequest {
  return {
    disciplinaId: formData.disciplinaId,
    turmaId: formData.turmaId,
    professorId: formData.professorId,
    diaSemana: formData.diaSemana as DiaSemana,
    sala: formData.sala,
    horarioId: formData.horarioId,
  };
}

export function mapFormDataToAulaPutRequest(formData: AulaFormData, id: string): AulaPutRequest {
  return {
    id,
    disciplinaId: formData.disciplinaId,
    turmaId: formData.turmaId,
    professorId: formData.professorId,
    diaSemana: formData.diaSemana as DiaSemana,
    sala: formData.sala,
    horarioId: formData.horarioId,
  };
}

/**
 * Mapeia os dados da aula da API para o formato do formulário
 */
export function mapAulaResponseToFormData(aula: AulaDetalheResponse): AulaFormData {
  return {
    disciplinaId: aula.disciplinaId || 0,
    turmaId: aula.turmaId || 0,
    professorId: aula.professorId || 0,
    diaSemana: (aula.diaSemana as AulaFormData["diaSemana"]) || "MONDAY",
    sala: aula.sala || "",
    horarioId: aula.horarioId || 0,
  };
}
