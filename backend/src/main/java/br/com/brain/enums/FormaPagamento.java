package br.com.brain.enums;

/**
 * Como o dinheiro entrou.
 *
 * Interessa para conferencia de caixa, nao para contabilidade: dinheiro e
 * cheque a secretaria confere na mao, Pix e cartao conferem contra o extrato. Os
 * nomes sao os mesmos do CHECK em pagamentos.forma -- se entrar forma nova aqui,
 * entra migration junto, senao o banco recusa a baixa.
 */
public enum FormaPagamento {
    DINHEIRO,
    PIX,
    TRANSFERENCIA,
    CARTAO_CREDITO,
    CARTAO_DEBITO,
    /** Baixa manual de boleto. Na V2 a baixa de boleto passa a vir por webhook. */
    BOLETO,
    CHEQUE,
    OUTRO
}
