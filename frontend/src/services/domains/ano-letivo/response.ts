export type StatusAnoLetivo = "PLANEJAMENTO" | "ABERTO" | "ENCERRADO";

export interface PeriodoLetivoResponse {
  id: number;
  sequencia: number;
  nome: string;
  dataInicio: string;
  dataFim: string;
}

/**
 * Ano letivo da escola. Só um fica ABERTO por vez (o ano corrente); os
 * ENCERRADOS são histórico, somente leitura.
 */
export interface AnoLetivoResponse {
  ano: number;
  status: StatusAnoLetivo;
  dataInicio: string;
  dataFim: string;
  abertoEm: string | null;
  encerradoEm: string | null;
  periodos: PeriodoLetivoResponse[];
}
