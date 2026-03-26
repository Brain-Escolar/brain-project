export interface UnidadePostRequest {
  nome: string;
}

export interface UnidadePutRequest extends UnidadePostRequest {
  id: number;
}
