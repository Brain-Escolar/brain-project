export interface GrupoDisciplinaListaResponse {
  id: number;
  nome: string;
  area: string;
}

export interface GrupoDisciplinaDetalheResponse {
  id: number;
  nome: string;
  area: string;
  descricao?: string;
}
