export interface ComunicadoListResponse {
  id: number;
  titulo: string;
  conteudo: string;
  data: string; // YYYY-MM-DD (LocalDate)
}

export interface ComunicadoCreateRequest {
  titulo: string;
  conteudo: string;
  data: string; // YYYY-MM-DD
}

export interface ComunicadoUpdateRequest {
  titulo?: string;
  conteudo?: string;
  data?: string; // YYYY-MM-DD
}
