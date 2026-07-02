export interface TarefaResponse {
  id: string;
  conteudo: string;
  documentoUrl?: string;
  professor: string;
  aulaId: number;
  turmaId: number;
  turma: string;
  serieId: number;
  serie: string;
  disciplina: string;
  disciplinaId: number;
  prazo: string; // "YYYY-MM-DD" — serialized by ListagemTarefaDto via LocalDate.toString()
}

export interface TarefaLoteResponse {
  turmasRegistradas: number;
  tarefasCriadas: number;
  tarefas: TarefaResponse[];
}
