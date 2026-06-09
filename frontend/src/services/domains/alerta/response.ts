export interface AlertaResponse {
  id: string;
  titulo: string;
  conteudo: string;
  data: number[]; // [year, month, day]
}

export interface AlertaUsuarioResponse {
  id: number;
  titulo: string;
  conteudo: string;
  data: number[]; // [year, month, day]
  lido: boolean;
}
