export interface FichaMedicaPostRequest {
  dadosPessoaisId: number;
  tipoSanguineo?: string;
  necessidadesEspeciais?: string;
  doencasRespiratorias?: string;
  alergiasAlimentares?: string;
  alergiasMedicamentosas?: string;
  laudos?: File[];
}

export interface FichaMedicaPutRequest {
  id: string;
  tipoSanguineo?: string;
  necessidadesEspeciais?: string;
  doencasRespiratorias?: string;
  alergiasAlimentares?: string;
  alergiasMedicamentosas?: string;
  laudos?: string;
}
