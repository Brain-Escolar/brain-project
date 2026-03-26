export interface DisciplinaPostRequest {
  serieId: number;
  nome: string;
  cargaHoraria: number;
  grupoId: number;
}

export interface DisciplinaPutRequest extends DisciplinaPostRequest {
  id: string;
}
