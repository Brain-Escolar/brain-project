/**
 * Opções da ficha médica. As chaves espelham os enums do backend
 * (TipoSanguineo, TipoLaudo, TipoUsoMedicacao) e são o que trafega na API.
 */

export interface OpcaoFichaMedica {
  key: string;
  label: string;
}

export const TIPOS_SANGUINEOS: OpcaoFichaMedica[] = [
  { key: "A_POSITIVO", label: "A+" },
  { key: "A_NEGATIVO", label: "A-" },
  { key: "B_POSITIVO", label: "B+" },
  { key: "B_NEGATIVO", label: "B-" },
  { key: "AB_POSITIVO", label: "AB+" },
  { key: "AB_NEGATIVO", label: "AB-" },
  { key: "O_POSITIVO", label: "O+" },
  { key: "O_NEGATIVO", label: "O-" },
];

export const TIPOS_LAUDO: OpcaoFichaMedica[] = [
  { key: "NEUROPSICOLOGICO", label: "Neuropsicológico" },
  { key: "PSICOLOGICO", label: "Psicológico" },
  { key: "PSIQUIATRICO", label: "Psiquiátrico" },
  { key: "FONOAUDIOLOGICO", label: "Fonoaudiológico" },
  { key: "OFTALMOLOGICO", label: "Oftalmológico" },
  { key: "AUDITIVO", label: "Auditivo" },
  { key: "ATESTADO_MEDICO", label: "Atestado médico" },
  { key: "OUTRO", label: "Outro" },
];

export const TIPO_USO_PERIODO = "PERIODO";
export const TIPO_USO_CONTINUO = "CONTINUO";

export const TIPOS_USO_MEDICACAO: OpcaoFichaMedica[] = [
  { key: TIPO_USO_PERIODO, label: "Período determinado" },
  { key: TIPO_USO_CONTINUO, label: "Uso contínuo" },
];

/**
 * O detalhamento da ficha devolve o tipo sanguíneo já formatado ("A+"), mas a
 * escrita espera a chave do enum ("A_POSITIVO") — esta função faz a volta.
 */
export function chaveTipoSanguineo(valor?: string | null): string {
  if (!valor) return "";
  const porChave = TIPOS_SANGUINEOS.find((opcao) => opcao.key === valor);
  if (porChave) return porChave.key;
  return TIPOS_SANGUINEOS.find((opcao) => opcao.label === valor)?.key ?? "";
}
