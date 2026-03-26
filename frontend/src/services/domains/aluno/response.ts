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
  nomeSocial: string;
  email: string;
  emailEscolar: string;
  telefones: string[];
  endereco: AlunoEnderecoResponse;
  rg: string;
}

export interface AlunoDetalheResponse {
  id: number;
  cpf: string;
  matricula: string;
  nome: string;
  nomeSocial: string;
  email: string;
  telefones: string[];
  endereco: AlunoEnderecoResponse;
  rg: string;
  dataDeNascimento?: string;
  genero?: string;
  corRaca?: string;
  cidadeNaturalidade?: string;
}
