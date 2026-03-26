import { AlertaFormData } from "@/app/(private)/alerta/schema";
import { AlertaPostRequest, AlertaPutRequest } from "@/services/domains/alerta/request";
import { AlertaResponse } from "@/services/domains/alerta/response";
import { convertDateStringToISO } from "@/utils/utilsDate";

export function mapFormDataToAlertaPostRequest(formData: AlertaFormData): AlertaPostRequest {
  return {
    titulo: formData.titulo,
    conteudo: formData.conteudo,
    data: convertDateStringToISO(formData.data),
  };
}

export function mapFormDataToAlertaPutRequest(
  formData: AlertaFormData,
  id: string,
): AlertaPutRequest {
  return {
    id,
    titulo: formData.titulo,
    conteudo: formData.conteudo,
    data: convertDateStringToISO(formData.data),
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
 * Mapeia os dados do alerta da API para o formato do formulário
 */
export function mapAlertaResponseToFormData(alerta: AlertaResponse): AlertaFormData {
  return {
    titulo: alerta.titulo || "",
    conteudo: alerta.conteudo || "",
    data: alerta.data ? convertArrayToDateString(alerta.data) : "",
  };
}
