export type StatusAlunoProduto = "ATIVO" | "CANCELADO";

/** RECORRENTE: mensalidade. UNICO: taxa de matrícula, material. EVENTUAL: passeio. */
export type NaturezaProduto = "RECORRENTE" | "UNICO" | "EVENTUAL";

export interface AlunoProdutoResponse {
  id: number;
  alunoId: number;
  alunoNome: string;
  produtoModalidadeId: number;
  produtoNome: string;
  modalidade: string;
  valorOriginal: number;
  desconto: number;
  valorPago: number;
  dataCompra: string;
  status: StatusAlunoProduto;
}

export interface ProdutoResponse {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  natureza: NaturezaProduto | null;
  permiteBolsa: boolean;
}

export interface ModalidadeResponse {
  id: number;
  produtoId: number;
  modalidade: string;
  valor: number | null;
  ativo: boolean;
}

export interface ProdutoDetalheResponse extends ProdutoResponse {
  modalidades: ModalidadeResponse[];
}

/**
 * Uma linha da tabela de preços.
 *
 * Vem o histórico inteiro, não só o vigente: esta tabela É o histórico de preço
 * — não há auditoria paralela —, então esconder as linhas antigas esconderia a
 * única resposta para "quanto custava quando o contrato foi assinado".
 */
export interface PrecoResponse {
  id: number;
  modalidadeId: number;
  anoLetivo: number | null;
  unidadeId: number | null;
  unidadeNome: string | null;
  serieId: number | null;
  serieNome: string | null;
  turno: string | null;
  valor: number;
  vigenciaInicio: string;
  vigenciaFim: string | null;
  /** Quantas dimensões a linha preenche: o preço geral fica em cima, as exceções embaixo. */
  especificidade: number;
  vigenteHoje: boolean;
}
