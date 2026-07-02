export interface HoleriteArquivoResponse {
  id: number;
  nome: string;
  contentType: string;
  tamanho: number;
  downloadUrl: string;
}

export interface HoleriteResponse {
  id: number;
  ano: number;
  mes: number;
  arquivo: HoleriteArquivoResponse;
}
