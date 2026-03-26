export interface NotaPostRequest {
  alunoId: number;
  avaliacaoId: number;
  pontuacao: number;
  periodoReferencia: string;
}

export interface NotaPutRequest extends NotaPostRequest {
  id: string;
}
