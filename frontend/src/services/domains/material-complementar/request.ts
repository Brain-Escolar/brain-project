import { TipoMaterial } from "./response";

export interface MaterialComplementarPostRequest {
  disciplinaId: number;
  titulo: string;
  descricao?: string;
  tipo: TipoMaterial;
  url?: string;
}
