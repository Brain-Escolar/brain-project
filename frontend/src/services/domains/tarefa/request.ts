export interface TarefaPostRequest {
  conteudo: string;
  aulaId: number;
  prazo: string; // ISO date string
  dataCriacao?: string; // ISO date string — padrão: hoje
}

export interface TarefaLotePostRequest {
  semanaInicio: string; // ISO date string (segunda-feira da semana)
  numeroAula: number;   // 1-based
  serieId: number;
  disciplinaId: number;
  conteudo: string;
  tarefa: string;
}

export interface TarefaPutRequest {
  id: string;
  conteudo: string;
  prazo: string; // ISO date string
  arquivo?: File;
}
