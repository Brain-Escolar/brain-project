export interface TurmaPostRequest {
  nome: string;
  anoLetivo: number;
  serieId: number;
  turno: string;
  unidadeId: number;
  salaFisica?: string;
  vagasTotais: number;
  gradeCurricularId: number;
}

export interface TurmaPutRequest extends TurmaPostRequest {
  id: string;
}

export interface TurmaVincularAlunosRequest {
  turmaId: string;
  alunoIds: number[];
}

export interface TurmaDefinirHorarioRequest {
  turmaId: string;
  horarios: TurmaHorarioItemRequest[];
}

export interface TurmaHorarioItemRequest {
  diaSemana: string;
  horarioId: number;
  disciplinaId: number;
  professorId: number;
}
