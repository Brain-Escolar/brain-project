/**
 * Monta a proposta a partir do catálogo vigente. Nenhum valor vem daqui: preço de
 * tabela é do sistema, não de quem preenche a tela.
 */
export interface CriarSimulacaoRequest {
  /** Lead vindo do CRM. Um dos dois — este ou alunoId — é obrigatório. */
  processoMatriculaId?: number;
  /** Rematrícula de aluno que já existe. */
  alunoId?: number;
  responsavelId?: number;
  anoLetivo: number;
  unidadeId: number;
  serieId: number;
  turno?: string;
  qtdParcelas: number;
  diaVencimento: number;
}
