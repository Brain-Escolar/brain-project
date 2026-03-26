export interface AlertaPostRequest {
  titulo: string;
  conteudo: string;
  data: string; // ISO date string
}

export interface AlertaPutRequest {
  id: string;
  titulo: string;
  conteudo: string;
  data: string; // ISO date string
}
