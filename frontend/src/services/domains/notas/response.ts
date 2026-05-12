export interface NotaListaResponse {
  id: number;
  aluno: string;
  disciplina: string;
  avaliacao: string;
  pontuacao: number;
}

export interface NotaDetalheResponse {
  id: number;
  alunoId: number;
  avaliacaoId: number;
  pontuacao: number;
  periodoReferencia: string;
}

export interface NotaDisciplinaItemResponse {
  nomeAvaliacao: string;
  dataAplicacao: string;
  pontuacao: number;
}

export interface NotasAlunoDisciplinaResponse {
  nomeCompleto: string;
  notas: NotaDisciplinaItemResponse[];
}
