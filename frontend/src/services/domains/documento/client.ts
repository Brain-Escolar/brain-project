import { httpClient } from "@/services/http";
import { IBrainResult } from "@/services/commoResponse";
import {
  DocumentacaoAlunoResponse,
  DocumentoFilaResponse,
  DocumentoResponse,
  FotoResponse,
  TipoDocumento,
} from "./response";
import { AprovarDocumentoRequest, DocumentoFilaParams, RejeitarDocumentoRequest } from "./request";

const BASE_ROUTE = "documentos";

/** Máximo de arquivos por documento (frente e verso, páginas). Mesmo limite do backend. */
export const MAX_ARQUIVOS_POR_DOCUMENTO = 5;

/** Monta o multipart esperado pelos endpoints de envio: `tipo` + partes `arquivos`. */
export function montarFormDocumento(tipo: TipoDocumento, arquivos: File[]): FormData {
  const formData = new FormData();
  formData.append("tipo", tipo);
  arquivos.forEach((arquivo) => formData.append("arquivos", arquivo));
  return formData;
}

export function montarFormFoto(foto: File): FormData {
  const formData = new FormData();
  formData.append("foto", foto);
  return formData;
}

/** Documentos de matrícula — visão da escola (secretaria, coordenação, direção). */
export class DocumentoApi {
  getDocumentacaoAluno(alunoId: number): Promise<DocumentacaoAlunoResponse> {
    return httpClient.get(`${BASE_ROUTE}/aluno/${alunoId}`);
  }

  getFila(params?: DocumentoFilaParams): Promise<IBrainResult<DocumentoFilaResponse>> {
    return httpClient.get(BASE_ROUTE, { params });
  }

  getDocumento(id: number): Promise<DocumentoResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  enviar(
    dadosPessoaisId: number,
    tipo: TipoDocumento,
    arquivos: File[],
  ): Promise<DocumentoResponse> {
    return httpClient.post(
      `${BASE_ROUTE}/pessoa/${dadosPessoaisId}`,
      montarFormDocumento(tipo, arquivos),
    );
  }

  aprovar(id: number, dados: AprovarDocumentoRequest): Promise<DocumentoResponse> {
    return httpClient.post(`${BASE_ROUTE}/${id}/aprovar`, dados);
  }

  rejeitar(id: number, dados: RejeitarDocumentoRequest): Promise<DocumentoResponse> {
    return httpClient.post(`${BASE_ROUTE}/${id}/rejeitar`, dados);
  }

  atualizarFoto(dadosPessoaisId: number, foto: File): Promise<FotoResponse> {
    return httpClient.put(`${BASE_ROUTE}/pessoa/${dadosPessoaisId}/foto`, montarFormFoto(foto));
  }
}
