export interface TetoBolsaParams {
  anoLetivo: number;
  tipoBolsaId: number;
  unidadeId: number;
  serieId: number;
  turno?: string;
  qtdParcelas?: number;
  /**
   * Data em que a proposta está sendo feita, não "hoje". A matriz do ano letivo
   * seguinte começa a valer durante a campanha, e uma proposta revista depois
   * precisa ser avaliada pela regra que valia quando foi feita. Omitido, o
   * backend usa a data de hoje.
   */
  dataProposta?: string;
}

/**
 * O perfil NÃO vai aqui: é lido do token no backend. Se viesse da requisição,
 * qualquer um pediria o teto de diretor.
 */
export interface ReservarBolsaRequest {
  simulacaoId: number;
  tipoBolsaId: number;
  percentual: number;
  motivo?: string;
  /** Por quantos dias a proposta segura orçamento. Omitido, o backend usa 15. */
  diasValidade?: number;
}
