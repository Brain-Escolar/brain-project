export interface SecretarioListaResponse {
  id: number;
  dadosPessoaisId: number;
  cpf: string;
  nome: string;
  nomeSocial?: string;
  email: string;
  rg?: string;
  carteiraDeTrabalho?: string;
}
