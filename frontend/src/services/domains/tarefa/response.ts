export interface TarefaResponse {
  id: string;
  conteudo: string;
  documentoUrl?: string;
  professor: string;
  prazo: string; // "YYYY-MM-DD" — serialized by ListagemTarefaDto via LocalDate.toString()
}
