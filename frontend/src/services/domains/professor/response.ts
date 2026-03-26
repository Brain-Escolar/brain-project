export interface ProfessorAulaResponse {
  id: number;
  disciplina: string;
  serie: string;
  turma: string;
  sala: string;
  professor: string;
  horarioInicio: number[];
  horarioFim: number[];
  quantidadeAlunos: number;
  unidade: string;
}

export interface ProfessorPlanejamentoResponse {
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
}

interface ProfessorEnderecoResponse {
  logradouro: string;
  bairro: string;
  cep: string;
  complemento: string;
  numero: string;
  uf: string;
  cidade?: string;
}

export interface ProfessorDadosBancariosResponse {
  nomeBanco: string;
  tipoConta: string;
  agencia: string;
  conta: string;
  chavePix: string;
}

export interface ProfessorDependenteResponse {
  nomeCompleto: string;
  cpf: string;
  dataDeNascimento: string;
  parentesco: string;
}

export interface ProfessorDisciplinaResponse {
  id: number;
  nome: string;
}

export interface ProfessorListaResponse {
  id: number;
  cpf: string;
  matricula: string;
  nome: string;
  nomeSocial: string;
  email: string;
  emailProfissional: string;
  endereco: ProfessorEnderecoResponse;
  rg: string;
  carteiraDeTrabalho: string;
}

export interface ProfessorDetalheResponse {
  id: number;
  cpf: string;
  matricula: string;
  nome: string;
  nomeSocial: string;
  email: string;
  emailProfissional: string;
  endereco: ProfessorEnderecoResponse;
  rg: string;
  carteiraDeTrabalho: string;
  tituloEleitor?: string;
  pisPasep?: string;
  dataDeNascimento?: string;
  genero?: string;
  corRaca?: string;
  cidadeNaturalidade?: string;
  telefones?: string[];
  disciplinas?: ProfessorDisciplinaResponse[];
  dadosBancarios?: ProfessorDadosBancariosResponse;
  dependentes?: ProfessorDependenteResponse[];
  escolaridade?: string;
  enquadramentoHoraAula?: string;
  exameAdmissionalRealizado?: boolean;
  dataInicioFerias?: string;
  dataFimFerias?: string;
  observacoesFerias?: string;
}

export interface ProfessorDisponibilidadeResponse {
  id: number;
  professorId: number;
  diaSemana: string;
  horarioInicio: string;
  horarioFim: string;
}

export interface ProfessorMultipleUrisResponse {
  id: number;
  uri: string;
}
