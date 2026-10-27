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
  /** Período letivo em que a avaliação conta; deduzido da data de aplicação. */
  periodoLetivoId: number | null;
  periodo: string | null;
  /** Período fechado: as notas não podem mais ser lançadas nem alteradas. */
  periodoFechado: boolean;
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
