export type DiaSemana =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface AulaPostRequest {
  disciplinaId: number;
  turmaId: number;
  professorId: number;
  diaSemana: DiaSemana;
  sala: string;
  horarioId: number;
}

export interface AulaPutRequest {
  id: string;
  disciplinaId: number;
  turmaId: number;
  professorId: number;
  diaSemana: DiaSemana;
  sala: string;
  horarioId: number;
}
