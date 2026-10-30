/**
 * Efetiva a matrícula a partir de uma proposta.
 *
 * Nenhum valor entra aqui, e isso é desenho e não esquecimento: preço, desconto,
 * parcelas e dia de vencimento vêm todos da simulação. Se a tela pudesse mandar
 * valor, o contrato poderia sair diferente da proposta que a família aceitou.
 */
export interface EfetivarMatriculaRequest {
  simulacaoId: number;
  /** Opcional: a enturmação pode acontecer depois, na tela de enturmação. */
  turmaId?: number;
  /** Padrão: hoje. É a data que vale para contagem de vaga. */
  dataEfetivacao?: string;
  /**
   * Mês da primeira parcela. Omitido, o backend usa fevereiro do ano letivo — ou
   * o mês da efetivação, se for mais tarde, para não gerar parcela vencida no
   * passado. O dia é ignorado: competência é sempre dia 1.
   */
  primeiraCompetencia?: string;
}
