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

export interface AulaAlunoResponse {
  id: number;
  nome: string;
  registros: number;
  faltas: number;
}

export interface AulaAnotacaoResponse {
  anotacaoId: number;
  nomeAluno: string;
  anotacao: string;
  observacao: string;
}

export interface ProximaAulaResponse {
  aulaId: number;
  data: string;
  horarioInicio: { hour: number; minute: number; second: number; nano: number };
  horarioFim: { hour: number; minute: number; second: number; nano: number };
}

export interface TarefaAulaResponse {
  id: number;
  titulo: string;
  conteudo: string;
  documentoUrl: string;
  professor: string;
  turmaId: number;
  turma: string;
  prazo: string;
}

export interface AulaInfoResponse {
  id: number;
  unidade: string;
  serie: string;
  turmaId: number;
  turma: string;
  disciplina: string;
  professor: string;
  diaDaSemana: string;
  sala: string;
  horarioInicio: string;
  horarioFim: string;
}
