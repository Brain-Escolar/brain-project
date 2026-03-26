import { TarefaFormData } from "@/app/(private)/tarefa/schema";
import { TarefaPostRequest, TarefaPutRequest } from "@/services/domains/tarefa/request";
import { TarefaResponse } from "@/services/domains/tarefa/response";
import { convertDateStringToISO } from "@/utils/utilsDate";

export function mapFormDataToTarefaPostRequest(formData: TarefaFormData): TarefaPostRequest {
  return {
    titulo: formData.titulo,
    conteudo: formData.conteudo || undefined,
    documentoUrl: formData.documentoUrl || undefined,
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
    documentoUrl: formData.documentoUrl || undefined,
    prazo: convertDateStringToISO(formData.prazo),
  };
}

/**
 * Converte um array de números [ano, mês, dia] para o formato dd/mm/yyyy
 */
function convertArrayToDateString(dateArray: number[]): string {
  if (!dateArray || dateArray.length < 3) return "";
  const [year, month, day] = dateArray;
  const dayStr = String(day).padStart(2, "0");
  const monthStr = String(month).padStart(2, "0");
  return `${dayStr}/${monthStr}/${year}`;
}

/**
 * Mapeia os dados da tarefa da API para o formato do formulário
 */
export function mapTarefaResponseToFormData(tarefa: TarefaResponse): TarefaFormData {
  return {
    titulo: tarefa.titulo || "",
    conteudo: tarefa.conteudo || "",
    documentoUrl: tarefa.documentoUrl || "",
    prazo: tarefa.prazo ? convertArrayToDateString(tarefa.prazo) : "",
  };
}
