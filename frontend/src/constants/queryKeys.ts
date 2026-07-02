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
    infos: () => [...QUERY_KEYS.aulas.all, "info"] as const,
    info: (id: string | number) => [...QUERY_KEYS.aulas.infos(), id] as const,
    alunos: (id: string | number) => [...QUERY_KEYS.aulas.all, "alunos", id] as const,
    proximaAula: (id: string | number, data: string) =>
      [...QUERY_KEYS.aulas.all, "proxima-aula", id, data] as const,
    anotacoes: (id: string | number, data: string) =>
      [...QUERY_KEYS.aulas.all, "anotacoes", id, data] as const,
    tarefas: (id: string | number, data: string) =>
      [...QUERY_KEYS.aulas.all, "tarefas", id, data] as const,
    tarefasDatas: (id: string | number) =>
      [...QUERY_KEYS.aulas.all, "tarefas-datas", id] as const,
    tarefaDiario: (id: string | number, data: string) =>
      [...QUERY_KEYS.aulas.all, "tarefa-diario", id, data] as const,
  },
  conteudos: {
    all: ["conteudos"] as const,
    porAulaData: (aulaId: string | number, data: string) =>
      [...["conteudos"], "aula", aulaId, data] as const,
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
    meus: () => [...QUERY_KEYS.alertas.all, "meus"] as const,
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
    fichaMedica: (id: string | number) => [...QUERY_KEYS.alunos.all, "ficha-medica", id] as const,
    anotacoesDisciplina: (alunoId: string | number, disciplinaId: string | number) =>
      [...QUERY_KEYS.alunos.all, "anotacoes-disciplina", alunoId, disciplinaId] as const,
    perfil: () => [...QUERY_KEYS.alunos.all, "perfil"] as const,
    cursosPretendidos: () => [...QUERY_KEYS.alunos.all, "cursos-pretendidos"] as const,
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
  avaliacaoTurmas: {
    all: ["avaliacaoTurmas"] as const,
    porAvaliacao: (avaliacaoId: string | number) =>
      [...QUERY_KEYS.avaliacaoTurmas.all, "avaliacao", avaliacaoId] as const,
    alunos: (avaliacaoTurmaId: string | number) =>
      [...QUERY_KEYS.avaliacaoTurmas.all, "alunos", avaliacaoTurmaId] as const,
  },
  notas: {
    all: ["notas"] as const,
    lists: () => [...QUERY_KEYS.notas.all, "list"] as const,
    details: () => [...QUERY_KEYS.notas.all, "detail"] as const,
    detail: (id: string | number) => [...QUERY_KEYS.notas.details(), id] as const,
    porAlunoDisciplina: (alunoId: string | number, disciplinaId: string | number) =>
      [...QUERY_KEYS.notas.all, "aluno-disciplina", alunoId, disciplinaId] as const,
  },
  turmas: {
    all: ["turmas"] as const,
    lists: () => [...QUERY_KEYS.turmas.all, "list"] as const,
    details: () => [...QUERY_KEYS.turmas.all, "detail"] as const,
    detail: (id: string | number) => [...QUERY_KEYS.turmas.details(), id] as const,
  },
  professorTurmas: {
    all: ["professorTurmas"] as const,
    lists: () => [...QUERY_KEYS.professorTurmas.all, "list"] as const,
    detail: (turmaId: string | number, disciplinaId: string | number) =>
      [...QUERY_KEYS.professorTurmas.all, "detail", turmaId, disciplinaId] as const,
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
      semana: () => [...QUERY_KEYS.estudante.aulas.all, "semana"] as const,
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
  comunicados: {
    all: ["comunicados"] as const,
    lists: (page?: number, size?: number) =>
      [...QUERY_KEYS.comunicados.all, "list", page, size] as const,
    details: () => [...QUERY_KEYS.comunicados.all, "detail"] as const,
    detail: (id: number) => [...QUERY_KEYS.comunicados.details(), id] as const,
  },
  planejamento: {
    all: ["planejamento"] as const,
    list: () => [...QUERY_KEYS.planejamento.all, "list"] as const,
  },
  chamadas: {
    all: ["chamadas"] as const,
    porAulaData: (aulaId: string | number, data: string) =>
      [...["chamadas"], "aula", aulaId, data] as const,
  },
  conversas: {
    all: ["conversas"] as const,
    remetente: (page?: number) => [...["conversas"], "remetente", page] as const,
    destinatario: (perfilNome?: string, page?: number) => [...["conversas"], "destinatario", perfilNome, page] as const,
    detail: (id: number) => [...["conversas"], "detail", id] as const,
    mensagens: (conversaId: number, page?: number) => [...["conversas"], "mensagens", conversaId, page] as const,
    destinatariosDisponiveis: () => [...["conversas"], "destinatarios-disponiveis"] as const,
  },
  eventos: {
    all: ["eventos"] as const,
    periodo: (dataInicio: string, dataFim: string) =>
      [...["eventos"], "periodo", dataInicio, dataFim] as const,
  },
  holerites: {
    all: ["holerites"] as const,
    meus: () => [...QUERY_KEYS.holerites.all, "meus"] as const,
  },
  informesRendimento: {
    all: ["informesRendimento"] as const,
    meus: () => [...QUERY_KEYS.informesRendimento.all, "meus"] as const,
  },
} as const;
