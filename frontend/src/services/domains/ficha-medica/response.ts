export interface FichaMedicaResponse {
  id: string;
  nome: string;
  tipoSanguineo: string;
  necessidadesEspeciais?: string;
  doencasRespiratorias?: string;
  alergiasAlimentares?: string;
  alergiasMedicamentosas?: string;
}

export interface ListagemArquivoResponse {
  id: number;
  nome: string;
  contentType: string;
  tamanho: number;
  downloadUrl: string;
}
