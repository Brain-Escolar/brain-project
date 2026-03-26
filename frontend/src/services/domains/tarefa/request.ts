export interface TarefaPostRequest {
  titulo: string;
  conteudo?: string;
  documentoUrl?: string;
  prazo: string; // ISO date string
}

export interface TarefaPutRequest {
  id: string;
  titulo: string;
  conteudo?: string;
  documentoUrl?: string;
  prazo: string; // ISO date string
}
