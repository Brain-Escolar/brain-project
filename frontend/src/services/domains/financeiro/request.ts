import { FormaPagamento } from "./response";

/**
 * Baixa manual de uma parcela.
 *
 * Valor e data são opcionais, e é isso que faz a tela ser rápida: no caso comum
 * — o pai pagou o valor da parcela hoje — a secretaria escolhe a forma e
 * confirma. Os dois campos existem para o que foge disso: Pix que caiu no sábado
 * e foi lançado na segunda, e boleto pago com juros.
 */
export interface BaixaRequest {
  forma: FormaPagamento;
  /** Omitido, usa hoje. O backend recusa data futura. */
  dataPagamento?: string;
  /**
   * Omitido, usa o líquido da parcela. Acima do líquido é aceito (juros, multa);
   * abaixo é recusado, porque deixaria um saldo que nenhum relatório cobra.
   */
  valorPago?: number;
  observacao?: string;
}

export interface EstornoRequest {
  motivo: string;
  /**
   * Emitir outra parcela no lugar. Omitido, o backend assume SIM — o título
   * estornado não volta para ABERTO, então sem a reemissão a dívida desaparece
   * do contas a receber e ninguém descobre até o fim do ano.
   */
  reemitir?: boolean;
  novoVencimento?: string;
}
