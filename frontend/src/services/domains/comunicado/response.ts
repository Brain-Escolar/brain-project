export type ComunicadoCategoria =
  | "EVENTO"
  | "ADMINISTRATIVO"
  | "CALENDARIO"
  | "ATUALIZACAO_RH";

/** Quem recebe o comunicado. */
export type ComunicadoPublico = "ALUNOS" | "RESPONSAVEIS" | "PROFESSORES" | "TODOS";

/** Qual recorte da escola recebe: toda ela, uma turma ou um segmento (série). */
export type ComunicadoAbrangencia = "GERAL" | "TURMA" | "SEGMENTO";

export interface ComunicadoDestinatario {
  publico: ComunicadoPublico;
  abrangencia: ComunicadoAbrangencia;
  turmaId?: number;
  turmaNome?: string;
  serieId?: number;
  serieNome?: string;
}

export interface ComunicadoDestinatarioRequest {
  publico: ComunicadoPublico;
  abrangencia: ComunicadoAbrangencia;
  turmaId?: number;
  serieId?: number;
}

export interface ComunicadoListResponse {
  id: number;
  titulo: string;
  conteudo: string;
  data: string; // YYYY-MM-DD (LocalDate)
  categoria?: ComunicadoCategoria;
  imagemUrl?: string;
  anexoUrl?: string;
  autorId?: number;
  autorNome?: string;
  dataCriacao?: string; // ISO-8601 (Instant)
  destinatarios?: ComunicadoDestinatario[];
}

export interface ComunicadoCreateRequest {
  titulo: string;
  conteudo: string;
  data: string; // YYYY-MM-DD
  categoria?: ComunicadoCategoria;
  anexoUrl?: string;
  destinatarios?: ComunicadoDestinatarioRequest[];
}

export interface ComunicadoUpdateRequest {
  titulo?: string;
  conteudo?: string;
  data?: string; // YYYY-MM-DD
  categoria?: ComunicadoCategoria;
  imagemUrl?: string;
  anexoUrl?: string;
  destinatarios?: ComunicadoDestinatarioRequest[];
}
