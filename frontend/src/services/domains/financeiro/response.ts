import { TituloResponse } from "@/services/domains/contrato";

export type FormaPagamento =
  | "DINHEIRO"
  | "PIX"
  | "TRANSFERENCIA"
  | "CARTAO_CREDITO"
  | "CARTAO_DEBITO"
  | "BOLETO"
  | "CHEQUE"
  | "OUTRO";

export type FaixaAging = "A_VENCER" | "ATE_30" | "DE_31_A_60" | "DE_61_A_90" | "ACIMA_DE_90";

export interface PagamentoResponse {
  id: number;
  tituloId: number;
  valorPago: number;
  dataPagamento: string;
  forma: FormaPagamento;
  observacao: string | null;
  registradoPorId: number;
  /** Nome de quem deu a baixa. Pode vir nulo se o cadastro estiver incompleto. */
  registradoPor: string | null;
  estornado: boolean;
  estornadoEm: string | null;
  motivoEstorno: string | null;
}

/**
 * O que volta de uma baixa ou de um estorno.
 *
 * Traz o título junto porque quem clicou precisa ver o status novo sem recarregar
 * o carnê. E `tituloReemitido` vem preenchido no estorno com reemissão: é a
 * parcela que nasceu no lugar, com o vencimento que ela ganhou. Sem isso a
 * secretaria não sabe se a dívida continua viva.
 */
export interface BaixaResponse {
  pagamento: PagamentoResponse;
  titulo: TituloResponse;
  tituloReemitido: TituloResponse | null;
}

export interface FaixaResumoResponse {
  faixa: FaixaAging;
  rotulo: string;
  quantidadeDeParcelas: number;
  valor: number;
  /** Fatia desta faixa dentro da carteira aberta, em %. */
  percentualDaCarteira: number;
}

/**
 * Uma linha da lista de cobrança. Carrega o nome do aluno E o do responsável
 * porque a secretaria liga para o responsável falando do aluno — com só um dos
 * dois a ligação não acontece.
 */
export interface InadimplenciaLinhaResponse {
  tituloId: number;
  contratoId: number;
  contratoNumero: string;
  alunoId: number;
  alunoNome: string | null;
  responsavelId: number;
  responsavelNome: string | null;
  numeroParcela: number;
  competencia: string;
  vencimento: string;
  diasDeAtraso: number;
  valorLiquido: number;
  faixa: FaixaAging;
}

/**
 * O relatório com aging.
 *
 * A carteira inteira vem junto de propósito: 40 mil em atraso é notícia muito
 * diferente se a carteira é 200 mil ou 2 milhões, e o número sozinho não diz
 * qual dos dois é. `linhas` traz só o que está em atraso — é a lista de quem
 * ligar.
 */
export interface InadimplenciaResponse {
  referencia: string;
  unidadeId: number | null;
  anoLetivo: number | null;
  carteiraAberta: number;
  totalEmAtraso: number;
  totalAVencer: number;
  percentualEmAtraso: number;
  parcelasEmAtraso: number;
  /** Alunos distintos com ao menos uma parcela em atraso. */
  alunosEmAtraso: number;
  faixas: FaixaResumoResponse[];
  linhas: InadimplenciaLinhaResponse[];
}
