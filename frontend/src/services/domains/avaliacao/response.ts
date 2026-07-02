import { TipoAvaliacao } from "./request";

export interface AvaliacaoListaResponse {
  id: number;
  nome: string;
  disciplina: string;
  tipo: TipoAvaliacao;
  notaMaxima: number;
  conteudo: string | null;
  totalTurmas: number;
  turmasLancadas: number;
  turmaIds: number[];
}

export interface AnexoResponse {
  id: number;
  nome: string;
  contentType: string;
  tamanho: number;
  downloadUrl: string;
}

export interface AvaliacaoTurmaResponse {
  id: number;
  turmaId: number;
  turma: string;
  professor: string | null;
  dataAplicacao: string | null;
  dataEntregaNotas: string | null;
  totalAlunos: number;
  alunosCorrigidos: number;
}

export interface AvaliacaoDetalheResponse {
  id: number;
  nome: string;
  disciplinaId: number;
  disciplina: string;
  tipo: TipoAvaliacao;
  notaMaxima: number;
  conteudo: string | null;
  notaExtra: boolean;
  anexos: AnexoResponse[];
  turmas: AvaliacaoTurmaResponse[];
}

export interface AlunoAvaliacaoTurmaResponse {
  id: number;
  nome: string;
}
