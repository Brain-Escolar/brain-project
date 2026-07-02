export type TipoAvaliacao = "PROVA" | "TRABALHO" | "LISTA" | "SEMINARIO";

export interface AvaliacaoTurmaInputRequest {
  turmaId: number;
  professorId?: number;
  dataAplicacao?: string;
  dataEntregaNotas?: string;
}

export interface AvaliacaoPostRequest {
  nome: string;
  disciplinaId: number;
  tipo: TipoAvaliacao;
  notaMaxima: number;
  conteudo?: string;
  notaExtra?: boolean;
  turmas: AvaliacaoTurmaInputRequest[];
}

export interface AvaliacaoPutRequest {
  id: string;
  nome?: string;
  disciplinaId?: number;
  tipo?: TipoAvaliacao;
  notaMaxima?: number;
  conteudo?: string;
  notaExtra?: boolean;
}

export interface AtualizacaoAvaliacaoTurmaRequest {
  professorId?: number;
  dataAplicacao?: string;
  dataEntregaNotas?: string;
}

export interface SalvarNotaAlunoRequest {
  alunoId: number;
  pontuacao: number;
}

export interface SalvarNotasAvaliacaoTurmaRequest {
  avaliacaoTurmaId: number;
  notas: SalvarNotaAlunoRequest[];
  periodoReferencia: string;
}
