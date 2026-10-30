export type StatusAnoLetivo = "PLANEJAMENTO" | "ABERTO" | "ENCERRADO";

export interface PeriodoLetivoResponse {
  id: number;
  sequencia: number;
  nome: string;
  dataInicio: string;
  dataFim: string;
  /** Preenchido quando o período foi fechado: notas e chamadas dele ficam definitivas. */
  fechadoEm: string | null;
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

/** O que o encerramento vai fazer, para a direção confirmar antes. */
export interface PreviaEncerramentoResponse {
  ano: number;
  matriculasAConcluir: number;
  matriculasSemTurma: number;
  preMatriculas: number;
  periodosAbertos: number;
}

export interface EncerramentoAnoResponse {
  ano: number;
  concluidas: number;
  aprovadas: number;
  reprovadas: number;
  semResultado: number;
  preMatriculasCanceladas: number;
}

export interface CopiaTurmasResponse {
  anoOrigem: number;
  anoDestino: number;
  criadas: number;
  jaExistiam: number;
}

export interface RematriculaResponse {
  anoOrigem: number;
  anoDestino: number;
  criadas: number;
  jaMatriculados: number;
  concluintes: number;
  semResultado: number;
  semDestino: number;
}
