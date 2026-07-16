export interface EstudanteAulaResponse {
  id: number;
  unidade: string;
  serie: string;
  turma: string;
  disciplina: string;
  professor: string;
  diaDaSemana: string;
  sala: string;
  horarioInicio: string;
  horarioFim: string;
  quantidadeAlunos: number;
}

export interface EstudanteAnotacaoResponse {
  disciplina: string;
  tipoAnotacao: string;
  data: string;
  observacao: string;
}

export interface EstudanteTarefaResponse {
  id: number;
  conteudo: string;
  documentoUrl?: string;
  professor: string;
  turma: string;
  serie: string;
  unidade: string;
  prazo: string;
}

// ===== Boletim =====

export interface BoletimEscalaResponse {
  type: string;
  minValue: number;
  maxValue: number;
  passingValue: number;
  decimalPlaces: number;
  label: string;
}

export interface BoletimPeriodoResponse {
  id: number;
  name: string;
  sequence: number;
  isCurrent: boolean;
}

export interface BoletimNotaPeriodoResponse {
  periodoId: number;
  sequence: number;
  nota: number | null;
  faltas: number;
}

export type BoletimSituacao = "APROVADO" | "REPROVADO" | "EM_ANDAMENTO";

export interface BoletimDisciplinaResponse {
  disciplinaId: number;
  nome: string;
  periodos: BoletimNotaPeriodoResponse[];
  notaAnual: number | null;
  recuperacao: number | null;
  notaFinal: number | null;
  totalFaltas: number;
  frequencia: number | null;
  situacao: BoletimSituacao;
}

export interface BoletimAlunoResponse {
  id: number;
  nome: string;
  serie: string;
  turma: string;
  unidade: string;
}

export interface BoletimResumoResponse {
  mediaGeral: number | null;
  frequenciaGeral: number | null;
  emRecuperacao: number;
  situacaoFinal: BoletimSituacao;
}

export interface BoletimResponse {
  anoAcademico: number;
  notaAprovacao: number;
  gradingScale: BoletimEscalaResponse;
  periodos: BoletimPeriodoResponse[];
  aluno: BoletimAlunoResponse;
  resumo: BoletimResumoResponse;
  disciplinas: BoletimDisciplinaResponse[];
}
