import { TurmaFormData } from "@/app/(private)/turma/schema";
import { TurmaPostRequest, TurmaPutRequest } from "@/services/domains/turma/request";
import { TurmaDetalheResponse } from "@/services/domains/turma/response";

export function mapFormDataToTurmaPostRequest(formData: TurmaFormData): TurmaPostRequest {
  return {
    nome: formData.nome,
    anoLetivo: Number(formData.anoLetivo),
    serieId: Number(formData.serieId),
    turno: formData.turno,
    unidadeId: Number(formData.unidadeId),
    salaFisica: formData.salaFisica || undefined,
    vagasTotais: Number(formData.vagasTotais),
    gradeCurricularId: Number(formData.gradeCurricularId),
  };
}

export function mapFormDataToTurmaPutRequest(formData: TurmaFormData, id: string): TurmaPutRequest {
  return {
    id,
    nome: formData.nome,
    anoLetivo: Number(formData.anoLetivo),
    serieId: Number(formData.serieId),
    turno: formData.turno,
    unidadeId: Number(formData.unidadeId),
    salaFisica: formData.salaFisica || undefined,
    vagasTotais: Number(formData.vagasTotais),
    gradeCurricularId: Number(formData.gradeCurricularId),
  };
}

export function mapTurmaResponseToFormData(turma: TurmaDetalheResponse): TurmaFormData {
  return {
    nome: turma.nome || "",
    anoLetivo: turma.anoLetivo ? String(turma.anoLetivo) : "",
    serieId: turma.serieId ? String(turma.serieId) : "",
    turno: turma.turno || "",
    unidadeId: turma.unidadeId ? String(turma.unidadeId) : "",
    salaFisica: turma.salaFisica || "",
    vagasTotais: turma.vagasTotais ? String(turma.vagasTotais) : "",
    gradeCurricularId: turma.gradeCurricularId ? String(turma.gradeCurricularId) : "",
  };
}
