export interface AulaResponse {
  turma: string;
  professor: string;
  disciplina: string;
  horario: string;
}

export interface AulaListaResponse {
  id: number;
  disciplina: string;
  turma: string;
  professor: string;
  diaDaSemana: string;
  sala: string;
  horario: string;
}

export interface AulaDetalheResponse {
  id: number;
  disciplinaId: number;
  turmaId: number;
  professorId: number;
  diaSemana: string;
  sala: string;
  horarioId: number;
}

export interface AulaAlunoResponse {
  id: string;
  nome: string;
  registros: number;
  faltas: number;
}

export interface AulaAnotacaoResponse {
  id: number;
  alunoId: number;
  alunoNome: string;
  data: string;
  descricao: string;
}
