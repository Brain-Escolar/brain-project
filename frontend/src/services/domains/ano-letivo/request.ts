export interface PeriodoLetivoRequest {
  nome: string;
  dataInicio: string;
  dataFim: string;
}

/** Calendário inteiro do ano, em ordem: a posição é a sequência (1º, 2º, ...). */
export interface PeriodosLetivosRequest {
  periodos: PeriodoLetivoRequest[];
}
