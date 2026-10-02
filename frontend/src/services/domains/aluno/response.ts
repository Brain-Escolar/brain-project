export interface AlunoResponse {
  id: number;
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefones: string[];
  email: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  created_at: string;
  updated_at: string;
}

interface AlunoEnderecoResponse {
  logradouro: string;
  bairro: string;
  cep: string;
  complemento: string;
  numero: string;
  uf: string;
  cidade?: string;
}

export interface AlunoListaResponse {
  id: number;
  cpf: string;
  matricula: string;
  nome: string;
  unidade: string;
  serie: string;
  turma: string;
  unidadeId?: number;
  serieId?: number;
  turmaId?: number;
  nomeSocial: string;
  email: string;
  emailEscolar: string;
  telefones: string[];
  endereco: AlunoEnderecoResponse;
  rg: string;
  matriculado: boolean;
  motivoDesmatricula?: string;
  dataDesmatricula?: string;
  criadoEm?: string;
  /** Dados completos E documentação completa. */
  cadastroCompleto: boolean;
  /** CPF, nascimento, endereço, telefone e responsável financeiro. */
  dadosCompletos: boolean;
  /** Documentos obrigatórios do aluno e dos responsáveis aprovados e no prazo. */
  documentacaoCompleta: boolean;
}

export interface ResponsavelResumoResponse {
  id: number;
  nome: string;
  telefones: string[];
  financeiro: boolean;
}

export interface AlunoDetalheResponse {
  id: number;
  cpf?: string;
  matricula: string;
  nome: string;
  nomeSocial: string;
  email?: string;
  telefones?: string[];
  endereco?: AlunoEnderecoResponse;
  rg?: string;
  dataDeNascimento?: string;
  genero?: string;
  corRaca?: string;
  cidadeNaturalidade?: string;
  matriculado?: boolean;
  cursoPretendido?: string;
  serieNome?: string;
  turmaNome?: string;
  serieId?: number;
  unidadeId?: number;
  turmaId?: number;
  emailEscolar?: string;
  motivoDesmatricula?: string;
  dataDesmatricula?: string;
  responsaveis?: ResponsavelResumoResponse[];
}

export interface CursoPretendidoResponse {
  nome: string;
  descricao: string;
}

export interface AnotacaoAlunoDisciplinaResponse {
  tipoAnotacao: string;
  data: string;
  observacao: string;
}

export interface ArquivoResponse {
  id: number;
  nome: string;
  contentType: string;
  tamanho: number;
  downloadUrl: string;
}

export interface LaudoMedicoResponse {
  id: number;
  /** Valor do enum TipoLaudo (ex: "NEUROPSICOLOGICO"). */
  tipo: string;
  /** Rótulo pronto para exibição, vindo do backend. */
  tipoDescricao: string;
  observacao?: string;
  arquivo?: ArquivoResponse;
}

/** Medicação em uso — a mesma que a família inclui pelo portal do responsável. */
export interface MedicacaoResponse {
  id: number;
  nome: string;
  dosagem?: string | null;
  horario?: string | null;
  observacao?: string | null;
  /** Instant do backend — ISO-8601 com timezone. */
  registradaEm?: string | null;
  /** "PERIODO" ou "CONTINUO". Nulo no que veio do portal e ainda não foi classificado. */
  tipoUso?: string | null;
  tipoUsoDescricao?: string | null;
  /** Preenchidos só quando tipoUso é PERIODO. */
  dataInicio?: string | null;
  dataFim?: string | null;
  receita?: ArquivoResponse | null;
}

export interface FichaMedicaAlunoResponse {
  id: number;
  nome: string;
  /** LocalDate — "yyyy-MM-dd". */
  dataDeNascimento?: string | null;
  tipoSanguineo: string;
  necessidadesEspeciais?: string;
  doencasRespiratorias?: string;
  /** As alergias do aluno vivem aqui — não há campo separado por medicação. */
  alergiasAlimentares?: string;
  alergiasMedicamentosas?: string;
  laudos: LaudoMedicoResponse[];
  medicacoes: MedicacaoResponse[];
}

export interface SituacaoFamiliarOpcaoResponse {
  id: number;
  descricao: string;
}

export interface SituacaoFamiliarResponse {
  /** Null enquanto o aluno não tem registro — a aba abre vazia, pronta para preencher. */
  id: number | null;
  descricao?: string | null;
  opcoesMarcadas: number[];
  /** Catálogo ativo, já enviado junto para a tela montar os checkboxes. */
  opcoesDisponiveis: SituacaoFamiliarOpcaoResponse[];
}

export interface AtendimentoPsicologicoResponse {
  id: number;
  /** ISO "AAAA-MM-DD". */
  data: string;
  profissional?: string | null;
  descricao: string;
  /** Laudo da ficha médica citado no atendimento, quando houver. */
  laudo?: LaudoMedicoResponse | null;
}
