export interface AlertaResponse {
  id: string;
  titulo: string;
  conteudo: string;
  data: number[]; // [year, month, day]
}
