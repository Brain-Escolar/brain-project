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
