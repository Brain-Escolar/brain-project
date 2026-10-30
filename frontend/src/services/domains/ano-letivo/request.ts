export interface PeriodoLetivoRequest {
  nome: string;
  dataInicio: string;
  dataFim: string;
}

/** Calendário inteiro do ano, em ordem: a posição é a sequência (1º, 2º, ...). */
export interface PeriodosLetivosRequest {
  periodos: PeriodoLetivoRequest[];
}

/**
 * Para onde vão os aprovados de cada série. `serieDestinoId` nulo marca a série
 * como final (concluintes); série fora da lista não rematricula aprovados.
 * Reprovado sempre repete a série.
 */
export interface RematriculaRequest {
  promocoes: { serieOrigemId: number; serieDestinoId: number | null }[];
}
