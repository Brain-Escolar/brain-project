export type TipoDocumento =
  | "DOCUMENTO_IDENTIDADE"
  | "CPF"
  | "CERTIDAO_NASCIMENTO"
  | "CARTEIRA_VACINACAO"
  | "HISTORICO_ESCOLAR"
  | "DECLARACAO_TRANSFERENCIA"
  | "COMPROVANTE_RESIDENCIA";

export type StatusDocumento = "EM_ANALISE" | "APROVADO" | "REJEITADO";

/** Visão do checklist: PENDENTE = nada enviado; VENCIDO = aprovado, mas fora da validade. */
export type SituacaoDocumento = "PENDENTE" | "EM_ANALISE" | "APROVADO" | "REJEITADO" | "VENCIDO";

export interface ArquivoDocumentoResponse {
  id: number;
  nome: string;
  contentType: string;
  tamanho: number;
  /** URL assinada do S3, válida por poucos minutos. */
  downloadUrl: string;
}

export interface DocumentoResponse {
  id: number;
  tipo: TipoDocumento;
  tipoDescricao: string;
  status: StatusDocumento;
  motivoRejeicao?: string | null;
  dataValidade?: string | null;
  enviadoEm: string;
  validadoPor?: string | null;
  validadoEm?: string | null;
  arquivos: ArquivoDocumentoResponse[];
}

export interface ItemChecklistDocumentoResponse {
  tipo: TipoDocumento;
  descricao: string;
  obrigatorio: boolean;
  situacao: SituacaoDocumento;
  documento: DocumentoResponse | null;
}

export type PapelDocumentacao = "ALUNO" | "RESPONSAVEL";

export interface DocumentacaoPessoaResponse {
  dadosPessoaisId: number;
  nome: string;
  papel: PapelDocumentacao;
  responsavelFinanceiro: boolean;
  fotoUrl: string | null;
  completa: boolean;
  itens: ItemChecklistDocumentoResponse[];
}

export interface DocumentacaoAlunoResponse {
  alunoId: number;
  completa: boolean;
  pessoas: DocumentacaoPessoaResponse[];
}

export interface DocumentoFilaResponse {
  id: number;
  tipo: TipoDocumento;
  tipoDescricao: string;
  status: StatusDocumento;
  enviadoEm: string;
  dadosPessoaisId: number;
  nomePessoa: string;
}

export interface FotoResponse {
  dadosPessoaisId: number;
  url: string;
}
