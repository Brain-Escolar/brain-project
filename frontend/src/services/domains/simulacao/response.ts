export type StatusSimulacaoFinanceira =
  | "RASCUNHO"
  | "RESERVADA"
  | "CONVERTIDA"
  | "EXPIRADA"
  | "PERDIDA";

export interface SimulacaoItemResponse {
  id: number;
  descricao: string;
  valorUnitario: number;
  quantidade: number;
  total: number;
  /** Se a bolsa incide sobre esta linha. Taxa de material normalmente não. */
  elegivelBolsa: boolean;
}

/**
 * O cálculo de quanto a família vai pagar, feito uma vez e reaproveitado pela
 * proposta ao lead, pelo carnê simulado, pelos títulos reais e pela tela de
 * financeiro do responsável.
 */
export interface SimulacaoResponse {
  id: number;
  anoLetivo: number;
  turno: string | null;
  qtdParcelas: number;
  diaVencimento: number;
  valorBruto: number;
  valorDesconto: number;
  valorLiquido: number;
  /**
   * Média simples: líquido dividido pelas parcelas. É média mesmo, não o valor do
   * boleto — produto de cobrança única (matrícula, taxa de material) entra inteiro
   * no bruto e aqui aparece diluído no ano. O carnê exato vem com os títulos.
   */
  valorParcelaMedia: number;
  status: StatusSimulacaoFinanceira;
  /** Até quando a proposta segura orçamento de bolsa. */
  reservaExpiraEm: string | null;
  contratoId: number | null;
  itens: SimulacaoItemResponse[];
}
