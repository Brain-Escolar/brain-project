import { HorarioFormData } from "@/app/(private)/horario/schema";
import { HorarioPostRequest, HorarioPutRequest } from "@/services/domains/horario/request";
import { HorarioDetalheResponse } from "@/services/domains/horario/response";

export function mapFormDataToHorarioPostRequest(formData: HorarioFormData): HorarioPostRequest {
  return {
    nome: formData.nome,
    horarioInicio: formData.horarioInicio,
    horarioFim: formData.horarioFim,
  };
}

export function mapFormDataToHorarioPutRequest(
  formData: HorarioFormData,
  id: string,
): HorarioPutRequest {
  return {
    id,
    nome: formData.nome,
    horarioInicio: formData.horarioInicio,
    horarioFim: formData.horarioFim,
  };
}

/**
 * Mapeia os dados do horário da API para o formato do formulário
 */
export function mapHorarioResponseToFormData(horario: HorarioDetalheResponse): HorarioFormData {
  return {
    nome: horario.nome || "",
    horarioInicio: horario.horarioInicio || "",
    horarioFim: horario.horarioFim || "",
  };
}
