export type TipoVinculo =
  | "ALUNO"
  | "RESPONSAVEL"
  | "PROFESSOR"
  | "SECRETARIO"
  | "DIRETOR"
  | "COORDENADOR"
  | "ORIENTADOR"
  | "RH";

export interface VinculoPessoa {
  tipo: TipoVinculo;
  descricao: string;
  /** false só para professor desligado. */
  ativo: boolean;
}

/** Pessoa já cadastrada em algum papel, achada pelo CPF/e-mail. */
export interface PessoaExistenteResponse {
  id: number;
  cpf: string | null;
  rg: string | null;
  nome: string;
  nomeSocial: string | null;
  email: string | null;
  dataDeNascimento: string | null;
  genero: string | null;
  corRaca: string | null;
  cidadeNaturalidade: string | null;
  carteiraDeTrabalho: string | null;
  endereco: {
    logradouro: string | null;
    bairro: string | null;
    cep: string | null;
    complemento: string | null;
    numero: string | null;
    uf: string | null;
    cidade: string | null;
  } | null;
  telefones: string[];
  vinculos: VinculoPessoa[];
}
