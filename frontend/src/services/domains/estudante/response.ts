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

// ===== Relatórios (notas e frequência) =====

export interface RelatorioEscalaResponse {
  type: string;
  minValue: number;
  maxValue: number;
  passingValue: number;
  decimalPlaces: number;
  label: string;
}

export interface RelatorioPeriodoResponse {
  id: number;
  name: string;
  sequence: number;
  isCurrent: boolean;
}

export interface RelatorioNotaPeriodoResponse {
  periodoId: number;
  sequence: number;
  nota: number | null;
  faltas: number;
}

export type RelatorioSituacao = "APROVADO" | "REPROVADO" | "EM_ANDAMENTO";

export interface RelatorioDisciplinaResponse {
  disciplinaId: number;
  nome: string;
  periodos: RelatorioNotaPeriodoResponse[];
  notaAnual: number | null;
  recuperacao: number | null;
  notaFinal: number | null;
  totalFaltas: number;
  frequencia: number | null;
  situacao: RelatorioSituacao;
}

export interface RelatorioAlunoResponse {
  id: number;
  nome: string;
  serie: string;
  turma: string;
  unidade: string;
}

export interface RelatorioResumoResponse {
  mediaGeral: number | null;
  frequenciaGeral: number | null;
  emRecuperacao: number;
  disciplinasAprovadas: number;
  totalDisciplinas: number;
  totalFaltas: number;
  emAlerta: number;
  situacaoFinal: RelatorioSituacao;
}

export interface RelatorioResponse {
  anoAcademico: number;
  notaAprovacao: number;
  frequenciaMinima: number;
  limiteFaltas: number;
  percentualLimiteFaltas: number;
  gradingScale: RelatorioEscalaResponse;
  periodos: RelatorioPeriodoResponse[];
  aluno: RelatorioAlunoResponse;
  resumo: RelatorioResumoResponse;
  disciplinas: RelatorioDisciplinaResponse[];
}
