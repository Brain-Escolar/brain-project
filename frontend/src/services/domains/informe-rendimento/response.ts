export interface InformeRendimentoArquivoResponse {
  id: number;
  nome: string;
  contentType: string;
  tamanho: number;
  downloadUrl: string;
}

export interface InformeRendimentoResponse {
  id: number;
  ano: number;
  mesesConsiderados: number;
  completo: boolean;
  arquivo: InformeRendimentoArquivoResponse;
}
