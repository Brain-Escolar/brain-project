export interface DisciplinaListaResponse {
  cargaHoraria: string;
  grupo: string;
  id: number;
  nome: string;
  serie: string;
  unidade: string;
}

export interface DisciplinaDetalheResponse {
  id: number;
  serieId: number;
  nome: string;
  cargaHoraria: number;
  grupoId: number;
}
