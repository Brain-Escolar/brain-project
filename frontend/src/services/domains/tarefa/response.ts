export interface TarefaResponse {
  id: string;
  titulo: string;
  conteudo: string;
  documentoUrl?: string;
  professor: string;
  prazo: number[];
}
