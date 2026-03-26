export interface GrupoDisciplinaPostRequest {
  nome: string;
  area: string;
}

export interface GrupoDisciplinaPutRequest extends GrupoDisciplinaPostRequest {
  id: string;
}
