export interface GoogleEventoRequest {
  titulo: string;
  descricao?: string;
  dataInicio: string; // ISO date-time, ex: "2026-06-15T14:00:00-03:00"
  dataFim: string; // ISO date-time
}

export interface GoogleEventosRequest {
  eventos: GoogleEventoRequest[];
}
