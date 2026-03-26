export interface TurmaListaResponse {
  id: number;
  nome: string;
  anoLetivo: number;
  serie: string;
  turno: string;
  unidade: string;
  vagasTotais: number;
  alunosMatriculados: number;
  gradeCurricular: string;
}

export interface TurmaDetalheResponse {
  id: number;
  nome: string;
  anoLetivo: number;
  serieId: number;
  turno: string;
  unidadeId: number;
  salaFisica?: string;
  vagasTotais: number;
  alunosMatriculados: number;
  gradeCurricularId: number;
}

export interface TurmaResponse {
  id: number;
  nome: string;
}

export interface TurmaAlunoResponse {
  id: number;
  alunoId: number;
  nome: string;
  matricula: string;
  dataVinculacao: string;
}

export interface TurmaHorarioItemResponse {
  id: number;
  diaSemana: string;
  horarioId: number;
  horarioNome: string;
  horarioInicio: string;
  horarioFim: string;
  disciplinaId: number;
  disciplinaNome: string;
  professorId: number;
  professorNome: string;
}
