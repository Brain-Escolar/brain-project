interface AlunoEnderecoRequest {
  logradouro: string;
  bairro: string;
  cep: string;
  cidade: string;
  uf: string;
  complemento: string;
  numero: string;
}

interface ResponsavelRequest {
  cpf: string;
  nome: string;
  email: string;
  dataDeNascimento: string;
  endereco: AlunoEnderecoRequest;
  financeiro: boolean;
  telefones: string[];
}

export interface AlunoPostRequest {
  cpf: string;
  rg: string;
  nome: string;
  nomeSocial: string;
  email: string;
  dataDeNascimento: string;
  endereco: AlunoEnderecoRequest;
  genero: string;
  corRaca: string;
  cidadeNaturalidade: string;
  telefones: string[];
  responsaveis?: ResponsavelRequest[];
}

export interface AlunoPutRequest extends AlunoPostRequest {
  id: string;
}

export interface AlunoVincularSerieRequest {
  serieId: number;
  unidadeId: number;
  turmaId: number;
}

export interface AlunoDesmatricularRequest {
  motivo: string;
}

export interface FichaMedicaDadosClinicosRequest {
  tipoSanguineo?: string;
  necessidadesEspeciais?: string;
  doencasRespiratorias?: string;
  alergiasAlimentares?: string;
  alergiasMedicamentosas?: string;
}

export interface LaudoMedicoRequest {
  arquivo: File;
  /** Valor do enum TipoLaudo; use "OUTRO" quando nenhum tipo servir. */
  tipo: string;
  observacao?: string;
}

export interface MedicacaoRequest {
  /** Receita — opcional, nem toda medicação chega com documento. */
  arquivo?: File | null;
  /** "PERIODO" ou "CONTINUO". */
  tipoUso: string;
  /** Ignorados pelo backend quando tipoUso é CONTINUO. */
  dataInicio?: string | null;
  dataFim?: string | null;
  medicamentos?: string;
  observacao?: string;
}

export interface SituacaoFamiliarRequest {
  descricao?: string;
  /** Substitui o conjunto atual de marcações. */
  opcoesMarcadas: number[];
}

export interface AtendimentoPsicologicoRequest {
  /** ISO "AAAA-MM-DD". */
  data: string;
  profissional?: string;
  descricao: string;
  /** Id de um laudo da ficha médica do próprio aluno. */
  laudoId?: number | null;
}
