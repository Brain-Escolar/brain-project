import { StatusDocumento } from "./response";

export interface AprovarDocumentoRequest {
  /** yyyy-MM-dd. Só para documentos que vencem (ex.: comprovante de residência). */
  dataValidade?: string;
}

export interface RejeitarDocumentoRequest {
  /** Aparece para a família no portal — diga o que precisa ser corrigido. */
  motivo: string;
}

export interface DocumentoFilaParams {
  status?: StatusDocumento;
  page?: number;
  size?: number;
}
