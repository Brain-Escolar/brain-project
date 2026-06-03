import { TarefaFormData } from "@/app/(private)/tarefa/schema";
import { TarefaPostRequest, TarefaPutRequest } from "@/services/domains/tarefa/request";
import { TarefaResponse } from "@/services/domains/tarefa/response";
import { convertDateStringToISO } from "@/utils/utilsDate";

export function mapFormDataToTarefaPostRequest(formData: TarefaFormData): TarefaPostRequest {
  return {
    conteudo: formData.conteudo,
    aulaId: 0,
    prazo: convertDateStringToISO(formData.prazo),
  };
}

export function mapFormDataToTarefaPutRequest(
  formData: TarefaFormData,
  id: string,
): TarefaPutRequest {
  return {
    id,
    conteudo: formData.conteudo,
    prazo: convertDateStringToISO(formData.prazo),
  };
}

function convertIsoToFormDate(prazo: string): string {
  if (!prazo) return "";
  const [year, month, day] = prazo.split("-");
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

export function mapTarefaResponseToFormData(tarefa: TarefaResponse): TarefaFormData {
  return {
    conteudo: tarefa.conteudo || "",
    prazo: tarefa.prazo ? convertIsoToFormDate(tarefa.prazo) : "",
  };
}
