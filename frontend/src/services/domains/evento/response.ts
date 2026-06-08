export type TipoEvento =
  | "PROVA"
  | "ENTREGA_PROVA"
  | "ENTREGA_NOTAS"
  | "REUNIAO"
  | "FERIADO"
  | "OUTRO";

export interface EventoResponse {
  id: number;
  titulo: string;
  descricao: string;
  dataEvento: string; // "yyyy-MM-dd"
  tipo: TipoEvento;
}
