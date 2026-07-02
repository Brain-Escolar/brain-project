export type TipoMaterial = "ARQUIVO" | "LINK";

export interface MaterialComplementarArquivoResponse {
  id: number;
  nome: string;
  contentType: string;
  tamanho: number;
  downloadUrl: string;
}

export interface MaterialComplementarResponse {
  id: number;
  disciplinaId: number;
  disciplinaNome: string;
  titulo: string;
  descricao: string | null;
  tipo: TipoMaterial;
  url: string | null;
  dominio: string | null;
  arquivo: MaterialComplementarArquivoResponse | null;
  criadoEm: string;
}
