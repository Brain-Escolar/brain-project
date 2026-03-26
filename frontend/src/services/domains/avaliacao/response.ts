export interface AvaliacaoListaResponse {
  id: number;
  nome: string;
  disciplina: string;
  peso: number;
  conteudo: string;
  notaExtra?: boolean;
}

export interface AvaliacaoDetalheResponse {
  id: number;
  nome: string;
  disciplinaId: number;
  disciplina: string;
  peso: number;
  conteudo: string;
  notaExtra: boolean;
}

export interface AvaliacaoAlunoResponse {
  alunoId: number;
  nomeAluno: string;
  nota: number | null;
  falta: boolean;
}

export interface AvaliacaoDetalhePageResponse {
  id: number;
  nomeAvaliacao: string;
  disciplina: string;
  turma: string;
  abertura: string;
  prazo: string;
  totalAlunos: number;
  notasLancadas: number;
  alunos: AvaliacaoAlunoResponse[];
}
