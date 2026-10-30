export interface SecretarioEnderecoRequest {
  logradouro: string;
  bairro: string;
  cep: string;
  cidade: string;
  uf: string;
  complemento: string;
  numero: string;
}

export interface SecretarioPostRequest {
  cpf: string;
  rg?: string;
  nome: string;
  nomeSocial?: string;
  email: string;
  dataDeNascimento: string;
  endereco: SecretarioEnderecoRequest;
  genero?: string;
  corRaca?: string;
  cidadeNaturalidade?: string;
  carteiraDeTrabalho?: string;
  telefones: string[];
}
