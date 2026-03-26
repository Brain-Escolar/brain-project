export interface SeriePostRequest {
  nome: string;
}

export interface SeriePutRequest extends SeriePostRequest {
  id: string;
}
