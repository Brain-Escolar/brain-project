import { DisciplinaFormData } from "@/app/(private)/disciplina/schema";
import { DisciplinaPostRequest, DisciplinaPutRequest } from "@/services/domains/disciplina/request";
import { DisciplinaDetalheResponse } from "@/services/domains/disciplina/response";

export function mapFormDataToDisciplinaPostRequest(
  formData: DisciplinaFormData,
): DisciplinaPostRequest {
  return {
    serieId: Number(formData.serieId),
    nome: formData.nome,
    cargaHoraria: Number(formData.cargaHoraria),
    grupoId: Number(formData.grupoId),
  };
}

export function mapFormDataToDisciplinaPutRequest(
  formData: DisciplinaFormData,
  id: string,
): DisciplinaPutRequest {
  return {
    id,
    serieId: Number(formData.serieId),
    nome: formData.nome,
    cargaHoraria: Number(formData.cargaHoraria),
    grupoId: Number(formData.grupoId),
  };
}

/**
 * Mapeia os dados da disciplina da API para o formato do formulário
 */
export function mapDisciplinaResponseToFormData(
  disciplina: DisciplinaDetalheResponse,
): DisciplinaFormData {
  return {
    serieId: disciplina.serieId?.toString() || "",
    nome: disciplina.nome || "",
    cargaHoraria: disciplina.cargaHoraria?.toString() || "",
    grupoId: disciplina.grupoId?.toString() || "",
  };
}
