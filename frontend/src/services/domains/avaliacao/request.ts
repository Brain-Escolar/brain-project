export interface AvaliacaoPostRequest {
  nome: string;
  disciplinaId: number;
  peso: number;
  conteudo: string;
  notaExtra: boolean;
}

export interface AvaliacaoPutRequest extends AvaliacaoPostRequest {
  id: string;
}

export interface SalvarNotasAlunoRequest {
  alunoId: number;
  nota: number | null;
  falta: boolean;
}

export interface SalvarNotasAvaliacaoRequest {
  avaliacaoId: number;
  alunos: SalvarNotasAlunoRequest[];
}
