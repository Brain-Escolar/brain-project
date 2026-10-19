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

// ─── Acompanhamento docente (Gestão Escolar › Professores) ─────────────────

export type SituacaoProfessor = "EM_DIA" | "PENDENTE" | "SEM_GRADE" | "INATIVO";
/** REGISTRADA = conteúdo ou chamada lançados; PENDENTE = já aconteceu sem registro; PREVISTA = ainda vai acontecer. */
export type SituacaoAula = "REGISTRADA" | "PENDENTE" | "PREVISTA";
export type SituacaoAvaliacao = "LANCADA" | "NO_PRAZO" | "ATRASADA" | "AGENDADA";

export interface PeriodoProfessoresResponse {
  nome: string;
  /** yyyy-MM-dd */
  inicio: string;
  fim: string;
}

export interface DiaSemanaProfessoresResponse {
  data: string;
  /** Dia da semana atual (segunda a sexta); `feriado` é o nome do feriado da escola, se houver. */
  feriado: string | null;
}

export interface ResumoProfessoresResponse {
  professoresAtivos: number;
  professoresSemGrade: number;
  diariosEmDia: number;
  professoresComGrade: number;
  aulasPendentes: number;
  avaliacoesPendentes: number;
  professoresComPendencia: number;
}

export interface DiaProfessorResponse {
  data: string;
  aulas: number;
  registradas: number;
  pendentes: number;
}

export interface ProfessorLinhaResponse {
  id: number;
  nome: string;
  disciplinas: string[];
  turmas: number;
  semana: DiaProfessorResponse[];
  /** Aulas do período que já aconteceram. */
  aulasPrevistas: number;
  aulasRegistradas: number;
  aulasPendentes: number;
  avaliacoesAplicadas: number;
  avaliacoesLancadas: number;
  avaliacoesPendentes: number;
  /** yyyy-MM-ddTHH:mm:ss, no fuso da escola. */
  ultimoRegistro: string | null;
  situacao: SituacaoProfessor;
}

/** Payload de `GET /diretor/professores`. */
export interface ProfessoresDiretorResponse {
  periodo: PeriodoProfessoresResponse;
  semana: DiaSemanaProfessoresResponse[];
  resumo: ResumoProfessoresResponse;
  professores: ProfessorLinhaResponse[];
}

export interface ProfessorAcompanhadoResponse {
  id: number;
  nome: string;
  email: string | null;
  disciplinas: string[];
  turnos: string[];
  unidades: string[];
  ativo: boolean;
  situacao: SituacaoProfessor;
}

export interface ResumoProfessorResponse {
  aulasPrevistas: number;
  aulasRegistradas: number;
  aulasPendentes: number;
  frequencia: number | null;
  avaliacoesAplicadas: number;
  avaliacoesLancadas: number;
  avaliacoesPendentes: number;
  ultimoRegistro: string | null;
}

export interface AulaPendenteResponse {
  data: string;
  turma: string;
  serie: string | null;
  disciplina: string;
  horario: string | null;
}

export interface TurmaProfessorResponse {
  turmaId: number;
  turma: string;
  serie: string | null;
  disciplinaId: number;
  disciplina: string;
  alunos: number;
  aulasPrevistas: number;
  aulasRegistradas: number;
  frequencia: number | null;
  media: number | null;
  avaliacoesLancadas: number;
  avaliacoes: number;
}

export interface AnotacaoAulaResponse {
  alunoId: number;
  aluno: string;
  tipo: string | null;
  tipoDescricao: string | null;
  observacao: string | null;
}

export interface AulaDiarioResponse {
  aulaId: number;
  turmaId: number;
  turma: string;
  serie: string | null;
  disciplina: string;
  horario: string | null;
  /** HH:mm:ss */
  inicio: string | null;
  fim: string | null;
  situacao: SituacaoAula;
  conteudo: string | null;
  /** Nulos quando a chamada não foi feita. */
  presentes: number | null;
  faltas: number | null;
  registradoEm: string | null;
  anotacoes: AnotacaoAulaResponse[];
}

export interface DiaDiarioResponse {
  data: string;
  feriado: string | null;
  aulas: AulaDiarioResponse[];
}

export interface SemanaDiarioResponse {
  inicio: string;
  fim: string;
  /** Segundas-feiras para navegar entre semanas; `proxima` é nula na semana atual. */
  anterior: string | null;
  proxima: string | null;
  dias: DiaDiarioResponse[];
}

export interface AvaliacaoProfessorResponse {
  id: number;
  nome: string;
  tipo: string | null;
  turmaId: number;
  turma: string;
  serie: string | null;
  disciplina: string | null;
  dataAplicacao: string | null;
  prazo: string | null;
  alunos: number;
  lancadas: number;
  media: number | null;
  situacao: SituacaoAvaliacao;
}

export interface AnotacaoProfessorResponse {
  id: number;
  alunoId: number;
  aluno: string;
  matricula: string | null;
  turma: string;
  serie: string | null;
  disciplina: string;
  data: string;
  tipo: string | null;
  tipoDescricao: string | null;
  observacao: string | null;
}

/** Payload de `GET /diretor/professores/{id}`. */
export interface AcompanhamentoProfessorResponse {
  professor: ProfessorAcompanhadoResponse;
  periodo: PeriodoProfessoresResponse;
  mediaMinima: number;
  resumo: ResumoProfessorResponse;
  aulasPendentes: AulaPendenteResponse[];
  turmas: TurmaProfessorResponse[];
  semana: SemanaDiarioResponse;
  avaliacoes: AvaliacaoProfessorResponse[];
  anotacoes: AnotacaoProfessorResponse[];
}

export interface LembretesEnviadosResponse {
  enviados: number;
}
