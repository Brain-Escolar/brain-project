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
  titulo: string;
  conteudo: string;
  documentoUrl?: string;
  professor: string;
  turma: string;
  serie: string;
  unidade: string;
  prazo: string;
}
