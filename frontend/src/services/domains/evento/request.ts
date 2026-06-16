import { TipoEvento } from "./response";

export interface EventoCreateRequest {
  titulo: string;
  descricao?: string;
  dataEvento: string; // "yyyy-MM-dd"
  tipo: TipoEvento;
  turmaId?: number;
  serieId?: number;
  unidadeId?: number;
  professorId?: number;
  avaliacaoId?: number;
}

export type EventoUpdateRequest = EventoCreateRequest;

export interface EventoDetalheResponse extends EventoCreateRequest {
  id: number;
}
