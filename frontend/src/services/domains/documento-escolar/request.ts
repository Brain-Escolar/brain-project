export interface BoletimParams {
  /** Sem ano, o backend usa o ano em curso (ou o último cursado). */
  anoLetivo?: number;
  /** Sequência do último período incluído. Sem ela, vai até o último já iniciado. */
  periodoAte?: number;
}
