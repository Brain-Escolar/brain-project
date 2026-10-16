import { ComunicadoListResponse } from "@/services/domains/comunicado/response";

/**
 * Números do topo do painel da Direção. Frequência e média são do período
 * letivo corrente e do anterior (para a variação); nulos quando ainda não há
 * chamada ou nota lançada no período.
 */
export interface IndicadoresDiretorResponse {
  alunosMatriculados: number;
  professoresAtivos: number;
  unidades: number;
  turmas: number;
  series: number;
  disciplinas: number;
  periodoAtual: string;
  periodoAnterior: string | null;
  frequenciaMedia: number | null;
  frequenciaPeriodoAnterior: number | null;
  mediaGeral: number | null;
  mediaPeriodoAnterior: number | null;
  notaAprovacao: number;
  notaMaxima: number;
}

export interface DesempenhoSerieResponse {
  serieId: number;
  serie: string;
  media: number | null;
}

export interface FrequenciaMensalResponse {
  ano: number;
  /** 1–12 */
  mes: number;
  frequencia: number;
}

/** Payload único de `GET /diretor/inicio`. */
export interface InicioDiretorResponse {
  indicadores: IndicadoresDiretorResponse;
  desempenhoPorSerie: DesempenhoSerieResponse[];
  frequenciaMensal: FrequenciaMensalResponse[];
  comunicados: ComunicadoListResponse[];
}

// ─── Acompanhamento por turma ────────────────────────────────────────────────

export interface PeriodoFiltroResponse {
  sequencia: number;
  nome: string;
  iniciado: boolean;
  atual: boolean;
}

export interface TurmaFiltroResponse {
  id: number;
  nome: string;
  serie: string;
  unidadeId: number;
  unidade: string;
  turno: string | null;
  sala: string | null;
}

export interface FiltrosAcompanhamentoResponse {
  anoLetivo: number;
  periodos: PeriodoFiltroResponse[];
  turmas: TurmaFiltroResponse[];
}

export interface AcompanhamentoParams {
  /** Sequência do período letivo; ausente = acumulado do ano. */
  periodo?: number;
  disciplinaId?: number;
}

export interface CriteriosAtencaoResponse {
  mediaMinima: number;
  frequenciaMinima: number;
  atrasosPorPeriodo: number;
  anotacoesPorPeriodo: number;
  periodosConsiderados: number;
}

export interface ResumoAcompanhamentoResponse {
  mediaTurma: number | null;
  alunosAbaixoMedia: number;
  frequenciaMedia: number | null;
  alunosAbaixoFrequencia: number;
  totalAtrasos: number;
  alunosComAtrasosRecorrentes: number;
  totalAnotacoes: number;
  alunosComAnotacoes: number;
  alunosEmAtencao: number;
}

export interface NotaDisciplinaAlunoResponse {
  disciplinaId: number;
  nome: string;
  media: number | null;
  faltas: number;
  aulas: number;
}

/** Os campos de topo seguem o recorte de disciplina; `geral`, atrasos e motivos, não. */
export interface AlunoAcompanhamentoResponse {
  id: number;
  nome: string;
  matricula: string | null;
  media: number | null;
  faltas: number;
  frequencia: number | null;
  anotacoes: number;
  geral: {
    media: number | null;
    disciplinasAbaixo: number;
    faltas: number;
    frequencia: number | null;
    anotacoes: number;
  };
  atrasos: number;
  /** yyyy-MM-dd, mais recente primeiro. */
  datasAtrasos: string[];
  /** Vazio = situação regular. */
  motivosAtencao: string[];
  disciplinas: NotaDisciplinaAlunoResponse[];
}

export interface DisciplinaAcompanhamentoResponse {
  id: number;
  nome: string;
  professor: string | null;
  media: number | null;
  alunosAbaixo: number;
  alunosComNota: number;
  faltas: number;
  frequencia: number | null;
  anotacoes: number;
}

export interface AnotacaoAcompanhamentoResponse {
  id: number;
  alunoId: number;
  aluno: string;
  /** yyyy-MM-dd */
  data: string | null;
  tipo: string;
  tipoDescricao: string;
  disciplinaId: number;
  disciplina: string;
  professor: string | null;
  observacao: string | null;
}

/** Payload de `GET /diretor/acompanhamento-turma/{turmaId}`. */
export interface AcompanhamentoTurmaResponse {
  turma: {
    id: number;
    nome: string;
    serie: string;
    unidade: string | null;
    turno: string | null;
    sala: string | null;
    totalAlunos: number;
  };
  periodo: string;
  disciplinaId: number | null;
  criterios: CriteriosAtencaoResponse;
  disciplinas: { id: number; nome: string }[];
  resumo: ResumoAcompanhamentoResponse;
  alunos: AlunoAcompanhamentoResponse[];
  desempenhoDisciplinas: DisciplinaAcompanhamentoResponse[];
  anotacoes: AnotacaoAcompanhamentoResponse[];
}
