/**
 * Query keys para o React Query
 * Organizados de forma hierárquica para facilitar invalidações
 */

export const QUERY_KEYS = {
  aulas: {
    all: ["aulas"] as const,
    lists: (data?: string) => [...QUERY_KEYS.aulas.all, "list", data] as const,
    list: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.aulas.lists(), { filters }] as const,
    details: () => [...QUERY_KEYS.aulas.all, "detail"] as const,
    detail: (id: string | number) => [...QUERY_KEYS.aulas.details(), id] as const,
  },
  tarefas: {
    all: ["tarefas"] as const,
    lists: () => [...QUERY_KEYS.tarefas.all, "list"] as const,
    details: () => [...QUERY_KEYS.tarefas.all, "detail"] as const,
    detail: (id: string | number) => [...QUERY_KEYS.tarefas.details(), id] as const,
  },
  alertas: {
    all: ["alertas"] as const,
    lists: () => [...QUERY_KEYS.alertas.all, "list"] as const,
    details: () => [...QUERY_KEYS.alertas.all, "detail"] as const,
    detail: (id: string | number) => [...QUERY_KEYS.alertas.details(), id] as const,
  },
  fichasMedicas: {
    all: ["fichasMedicas"] as const,
    lists: () => [...QUERY_KEYS.fichasMedicas.all, "list"] as const,
    details: () => [...QUERY_KEYS.fichasMedicas.all, "detail"] as const,
    detail: (id: string | number) => [...QUERY_KEYS.fichasMedicas.details(), id] as const,
  },
  professores: {
    all: ["professores"] as const,
    lists: () => [...QUERY_KEYS.professores.all, "list"] as const,
    details: () => [...QUERY_KEYS.professores.all, "detail"] as const,
    detail: (id: string | number) => [...QUERY_KEYS.professores.details(), id] as const,
  },
  disciplinas: {
    all: ["disciplinas"] as const,
    lists: () => [...QUERY_KEYS.disciplinas.all, "list"] as const,
    details: () => [...QUERY_KEYS.disciplinas.all, "detail"] as const,
    detail: (id: string | number) => [...QUERY_KEYS.disciplinas.details(), id] as const,
  },
  gruposDisciplina: {
    all: ["gruposDisciplina"] as const,
    lists: () => [...QUERY_KEYS.gruposDisciplina.all, "list"] as const,
    details: () => [...QUERY_KEYS.gruposDisciplina.all, "detail"] as const,
    detail: (id: string | number) => [...QUERY_KEYS.gruposDisciplina.details(), id] as const,
  },
  alunos: {
    all: ["alunos"] as const,
    lists: () => [...QUERY_KEYS.alunos.all, "list"] as const,
    details: () => [...QUERY_KEYS.alunos.all, "detail"] as const,
    detail: (id: string | number) => [...QUERY_KEYS.alunos.details(), id] as const,
  },
  series: {
    all: ["series"] as const,
    lists: () => [...QUERY_KEYS.series.all, "list"] as const,
    details: () => [...QUERY_KEYS.series.all, "detail"] as const,
    detail: (id: string | number) => [...QUERY_KEYS.series.details(), id] as const,
  },
  unidades: {
    all: ["unidades"] as const,
    lists: () => [...QUERY_KEYS.unidades.all, "list"] as const,
    details: () => [...QUERY_KEYS.unidades.all, "detail"] as const,
    detail: (id: string | number) => [...QUERY_KEYS.unidades.details(), id] as const,
  },
  avaliacoes: {
    all: ["avaliacoes"] as const,
    lists: () => [...QUERY_KEYS.avaliacoes.all, "list"] as const,
    details: () => [...QUERY_KEYS.avaliacoes.all, "detail"] as const,
    detail: (id: string | number) => [...QUERY_KEYS.avaliacoes.details(), id] as const,
  },
  avaliacaoDetalhe: {
    all: ["avaliacaoDetalhe"] as const,
    details: () => [...QUERY_KEYS.avaliacaoDetalhe.all, "detail"] as const,
    detail: (id: string | number) => [...QUERY_KEYS.avaliacaoDetalhe.details(), id] as const,
  },
  notas: {
    all: ["notas"] as const,
    lists: () => [...QUERY_KEYS.notas.all, "list"] as const,
    details: () => [...QUERY_KEYS.notas.all, "detail"] as const,
    detail: (id: string | number) => [...QUERY_KEYS.notas.details(), id] as const,
  },
  turmas: {
    all: ["turmas"] as const,
    lists: () => [...QUERY_KEYS.turmas.all, "list"] as const,
    details: () => [...QUERY_KEYS.turmas.all, "detail"] as const,
    detail: (id: string | number) => [...QUERY_KEYS.turmas.details(), id] as const,
  },
  horarios: {
    all: ["horarios"] as const,
    lists: () => [...QUERY_KEYS.horarios.all, "list"] as const,
    details: () => [...QUERY_KEYS.horarios.all, "detail"] as const,
    detail: (id: string | number) => [...QUERY_KEYS.horarios.details(), id] as const,
  },
  gradesCurriculares: {
    all: ["gradesCurriculares"] as const,
    lists: () => [...QUERY_KEYS.gradesCurriculares.all, "list"] as const,
    details: () => [...QUERY_KEYS.gradesCurriculares.all, "detail"] as const,
    detail: (id: string | number) => [...QUERY_KEYS.gradesCurriculares.details(), id] as const,
  },
  estudante: {
    aulas: {
      all: ["estudante", "aulas"] as const,
      lists: (data?: string) => [...QUERY_KEYS.estudante.aulas.all, "list", data] as const,
    },
    anotacoes: {
      all: ["estudante", "anotacoes"] as const,
      semana: () => [...QUERY_KEYS.estudante.anotacoes.all, "semana"] as const,
    },
    tarefas: {
      all: ["estudante", "tarefas"] as const,
      lists: () => [...QUERY_KEYS.estudante.tarefas.all, "list"] as const,
    },
  },
  // Outros recursos podem ser adicionados aqui futuramente
} as const;
