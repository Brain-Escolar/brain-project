export interface TarefaPostRequest {
  titulo: string;
  conteudo?: string;
  turmaId: number;
  prazo: string; // ISO date string
}

export interface TarefaPutRequest {
  id: string;
  titulo: string;
  conteudo?: string;
  prazo: string; // ISO date string
}
