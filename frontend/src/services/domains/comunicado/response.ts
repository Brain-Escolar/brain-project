export type ComunicadoCategoria =
  | "EVENTO"
  | "ADMINISTRATIVO"
  | "CALENDARIO"
  | "ATUALIZACAO_RH";

export interface ComunicadoListResponse {
  id: number;
  titulo: string;
  conteudo: string;
  data: string; // YYYY-MM-DD (LocalDate)
  categoria?: ComunicadoCategoria;
  imagemUrl?: string;
  anexoUrl?: string;
}

export interface ComunicadoCreateRequest {
  titulo: string;
  conteudo: string;
  data: string; // YYYY-MM-DD
  categoria?: ComunicadoCategoria;
  anexoUrl?: string;
}

export interface ComunicadoUpdateRequest {
  titulo?: string;
  conteudo?: string;
  data?: string; // YYYY-MM-DD
  categoria?: ComunicadoCategoria;
  imagemUrl?: string;
  anexoUrl?: string;
}
