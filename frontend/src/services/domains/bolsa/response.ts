/** Qual dos três limites está segurando a concessão. */
export type LimiteAtingido = "MATRIZ" | "ALCADA" | "ENVELOPE";

export type NaturezaEnvelope = "LIMITE_MAXIMO" | "META_MINIMA";

export type UnidadeMedidaEnvelope =
  | "VALOR_ABSOLUTO"
  | "PERCENTUAL_RECEITA"
  | "QUANTIDADE_EQUIVALENTE"
  | "SEM_LIMITE";

export type StatusConcessaoBolsa = "SIMULADA" | "RESERVADA" | "ATIVA" | "ENCERRADA" | "CANCELADA";

export interface TipoBolsaResponse {
  id: number;
  codigo: string;
  nome: string;
  /** Renúncia planejada consome orçamento; incentivo condicional não. */
  estrutural: boolean;
  exigeComprovacao: boolean;
  contaParaCebas: boolean;
  acumulaComOutras: boolean;
  ativo: boolean;
  /**
   * Produtos sobre os quais a bolsa incide. Vazio não é detalhe: sem produto
   * elegível o cálculo do teto falha, porque não há valor cheio sobre o que
   * aplicar o percentual.
   */
  produtoIds: number[];
}

export interface EnvelopeSaldoResponse {
  id: number;
  nome: string;
  natureza: NaturezaEnvelope;
  unidadeMedida: UnidadeMedidaEnvelope;
  /** Nulos quando a medida não é em dinheiro. */
  teto: number | null;
  consumido: number | null;
  saldo: number | null;
  tetoEquivalente: number | null;
  consumidoEquivalente: number | null;
  saldoEquivalente: number | null;
  /** Quanto deste envelope sobra, em % da anuidade cheia DESTE aluno. */
  percentualDisponivel: number;
  permiteExcedente: boolean;
}

/**
 * Os três tetos vêm separados de propósito. Quando o funcionário vê 20% e não
 * entende, a resposta está em qual dos três está segurando.
 */
export interface TetoConcessaoResponse {
  anoLetivo: number;
  tipoBolsa: string;
  valorCheioAnual: number;
  tetoMatrizPct: number;
  tetoAlcadaPct: number;
  tetoEnvelopePct: number;
  podeConcederPct: number;
  podeConcederValor: number;
  limiteAtingido: LimiteAtingido;
  /** Só vem preenchido quando o envelope é mesmo o mais restritivo. */
  envelopeRestritivo: EnvelopeSaldoResponse | null;
  envelopes: EnvelopeSaldoResponse[];
}

export interface ConcessaoBolsaResponse {
  id: number;
  simulacaoId: number | null;
  contratoId: number | null;
  tipoBolsa: string;
  percentual: number;
  valorRenunciaAnual: number;
  equivalenteBolsa: number;
  status: StatusConcessaoBolsa;
  vigenciaInicio: string;
  vigenciaFim: string | null;
  motivo: string | null;
  /** Concedida acima do que o envelope comportava, com aprovação registrada. */
  excedeuEnvelope: boolean;
  reservaExpiraEm: string | null;
}
