import { ComunicadoFormData } from "@/app/(private)/comunicados/schema";
import {
  ComunicadoCategoria,
  ComunicadoCreateRequest,
  ComunicadoListResponse,
  ComunicadoUpdateRequest,
} from "@/services/domains/comunicado/response";
import { convertDateStringToISO } from "@/utils/utilsDate";

export function mapFormDataToComunicadoPostRequest(
  formData: ComunicadoFormData,
): ComunicadoCreateRequest {
  return {
    titulo: formData.titulo,
    conteudo: formData.conteudo,
    data: convertDateStringToISO(formData.data),
    categoria: (formData.categoria as ComunicadoCategoria) || undefined,
    anexoUrl: formData.anexoUrl || undefined,
  };
}

export function mapFormDataToComunicadoPutRequest(
  formData: ComunicadoFormData,
  id: number,
): ComunicadoUpdateRequest & { id: number } {
  return {
    id,
    titulo: formData.titulo,
    conteudo: formData.conteudo,
    data: convertDateStringToISO(formData.data),
    categoria: (formData.categoria as ComunicadoCategoria) || undefined,
    anexoUrl: formData.anexoUrl || undefined,
  };
}

function convertIsoToFormDate(iso: string): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

export function mapComunicadoResponseToFormData(
  comunicado: ComunicadoListResponse,
): ComunicadoFormData {
  return {
    titulo: comunicado.titulo || "",
    conteudo: comunicado.conteudo || "",
    data: comunicado.data ? convertIsoToFormDate(comunicado.data) : "",
    categoria: comunicado.categoria || "",
    anexoUrl: comunicado.anexoUrl || "",
  };
}
