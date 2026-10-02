import {
  ComunicadoFormData,
  DestinatarioFormData,
  destinatarioDefaultValue,
} from "@/app/(private)/comunicados/schema";
import {
  ComunicadoCategoria,
  ComunicadoCreateRequest,
  ComunicadoDestinatario,
  ComunicadoDestinatarioRequest,
  ComunicadoListResponse,
  ComunicadoUpdateRequest,
} from "@/services/domains/comunicado/response";
import { convertDateStringToISO } from "@/utils/utilsDate";

const PUBLICO_LABEL: Record<ComunicadoDestinatario["publico"], string> = {
  TODOS: "Todos",
  ALUNOS: "Alunos",
  RESPONSAVEIS: "Responsáveis",
  PROFESSORES: "Professores",
};

/** Texto curto do público-alvo, ex.: "Responsáveis · Turma 3A". */
export function descreverDestinatario(destinatario: ComunicadoDestinatario): string {
  const publico = PUBLICO_LABEL[destinatario.publico];

  if (destinatario.abrangencia === "TURMA") {
    return `${publico} · Turma ${destinatario.turmaNome ?? ""}`.trim();
  }
  if (destinatario.abrangencia === "SEGMENTO") {
    return `${publico} · ${destinatario.serieNome ?? "Segmento"}`;
  }
  return `${publico} · Toda a escola`;
}

function mapFormDataToDestinatarios(
  destinatarios: DestinatarioFormData[],
): ComunicadoDestinatarioRequest[] {
  return destinatarios.map((destinatario) => ({
    publico: destinatario.publico,
    abrangencia: destinatario.abrangencia,
    turmaId:
      destinatario.abrangencia === "TURMA" && destinatario.turmaId
        ? Number(destinatario.turmaId)
        : undefined,
    serieId:
      destinatario.abrangencia === "SEGMENTO" && destinatario.serieId
        ? Number(destinatario.serieId)
        : undefined,
  }));
}

export function mapFormDataToComunicadoPostRequest(
  formData: ComunicadoFormData,
): ComunicadoCreateRequest {
  return {
    titulo: formData.titulo,
    conteudo: formData.conteudo,
    data: convertDateStringToISO(formData.data),
    categoria: (formData.categoria as ComunicadoCategoria) || undefined,
    destinatarios: mapFormDataToDestinatarios(formData.destinatarios),
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
    destinatarios: mapFormDataToDestinatarios(formData.destinatarios),
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
  // Comunicados criados antes dos destinatários vêm sem público: abrem como "Todos · Toda a escola".
  const destinatarios: DestinatarioFormData[] = comunicado.destinatarios?.length
    ? comunicado.destinatarios.map((destinatario) => ({
        publico: destinatario.publico,
        abrangencia: destinatario.abrangencia,
        turmaId: destinatario.turmaId ? String(destinatario.turmaId) : "",
        serieId: destinatario.serieId ? String(destinatario.serieId) : "",
      }))
    : [destinatarioDefaultValue];

  return {
    titulo: comunicado.titulo || "",
    conteudo: comunicado.conteudo || "",
    data: comunicado.data ? convertIsoToFormDate(comunicado.data) : "",
    categoria: comunicado.categoria || "",
    destinatarios,
  };
}
