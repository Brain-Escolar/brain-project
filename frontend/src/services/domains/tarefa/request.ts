export interface TarefaPostRequest {
  conteudo: string;
  turmaId: number;
  prazo: string; // ISO date string
  dataCriacao?: string; // ISO date string — padrão: hoje
}

export interface TarefaPutRequest {
  id: string;
  conteudo: string;
  prazo: string; // ISO date string
  arquivo?: File;
}
