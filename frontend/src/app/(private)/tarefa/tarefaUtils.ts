import { TarefaFormData } from "@/app/(private)/tarefa/schema";
import { TarefaPostRequest, TarefaPutRequest } from "@/services/domains/tarefa/request";
import { TarefaResponse } from "@/services/domains/tarefa/response";
import { convertDateStringToISO } from "@/utils/utilsDate";

export function mapFormDataToTarefaPostRequest(formData: TarefaFormData): TarefaPostRequest {
  return {
    titulo: formData.titulo,
    conteudo: formData.conteudo || undefined,
    turmaId: 0,
    prazo: convertDateStringToISO(formData.prazo),
  };
}

export function mapFormDataToTarefaPutRequest(
  formData: TarefaFormData,
  id: string,
): TarefaPutRequest {
  return {
    id,
    titulo: formData.titulo,
    conteudo: formData.conteudo || undefined,
    prazo: convertDateStringToISO(formData.prazo),
  };
}

/**
 * Converte uma string ISO "YYYY-MM-DD" para o formato do formulário "DD/MM/YYYY"
 */
function convertIsoToFormDate(prazo: string): string {
  if (!prazo) return "";
  const [year, month, day] = prazo.split("-");
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

/**
 * Mapeia os dados da tarefa da API para o formato do formulário
 */
export function mapTarefaResponseToFormData(tarefa: TarefaResponse): TarefaFormData {
  return {
    titulo: tarefa.titulo || "",
    conteudo: tarefa.conteudo || "",
    prazo: tarefa.prazo ? convertIsoToFormDate(tarefa.prazo) : "",
  };
}
