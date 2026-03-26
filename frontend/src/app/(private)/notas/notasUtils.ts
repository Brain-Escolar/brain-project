import { NotaFormData } from "@/app/(private)/notas/schema";
import { NotaPostRequest, NotaPutRequest } from "@/services/domains/notas/request";
import { NotaDetalheResponse } from "@/services/domains/notas/response";

export function mapFormDataToNotaPostRequest(formData: NotaFormData): NotaPostRequest {
  // Converter a data para o formato yyyy-MM-dd esperado pelo backend
  const date = new Date(formData.periodoReferencia);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const periodoReferencia = `${year}-${month}-${day}`;

  return {
    alunoId: Number(formData.alunoId),
    avaliacaoId: Number(formData.avaliacaoId),
    pontuacao: Number(formData.pontuacao),
    periodoReferencia,
  };
}

export function mapFormDataToNotaPutRequest(formData: NotaFormData, id: string): NotaPutRequest {
  // Converter a data para o formato yyyy-MM-dd esperado pelo backend
  const date = new Date(formData.periodoReferencia);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const periodoReferencia = `${year}-${month}-${day}`;

  return {
    id,
    alunoId: Number(formData.alunoId),
    avaliacaoId: Number(formData.avaliacaoId),
    pontuacao: Number(formData.pontuacao),
    periodoReferencia,
  };
}

/**
 * Mapeia os dados da nota da API para o formato do formulário
 */
export function mapNotaResponseToFormData(nota: NotaDetalheResponse): NotaFormData {
  return {
    alunoId: nota.alunoId?.toString() || "",
    avaliacaoId: nota.avaliacaoId?.toString() || "",
    pontuacao: nota.pontuacao?.toString() || "",
    periodoReferencia: nota.periodoReferencia || "",
  };
}
