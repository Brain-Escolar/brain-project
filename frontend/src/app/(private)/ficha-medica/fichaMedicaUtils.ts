import { FichaMedicaFormData } from "@/app/(private)/ficha-medica/schema";
import {
  FichaMedicaPostRequest,
  FichaMedicaPutRequest,
} from "@/services/domains/ficha-medica/request";
import { FichaMedicaResponse } from "@/services/domains/ficha-medica/response";

export function mapFormDataToFichaMedicaPostRequest(
  formData: FichaMedicaFormData,
): FichaMedicaPostRequest {
  return {
    dadosPessoaisId:
      typeof formData.dadosPessoaisId === "string"
        ? parseInt(formData.dadosPessoaisId)
        : formData.dadosPessoaisId,
    tipoSanguineo: formData.tipoSanguineo || undefined,
    necessidadesEspeciais: formData.necessidadesEspeciais || undefined,
    doencasRespiratorias: formData.doencasRespiratorias || undefined,
    alergiasAlimentares: formData.alergiasAlimentares || undefined,
    alergiasMedicamentosas: formData.alergiasMedicamentosas || undefined,
    laudos: formData.laudos && formData.laudos.length > 0 ? formData.laudos : undefined,
  };
}

export function mapFormDataToFichaMedicaPutRequest(
  formData: FichaMedicaFormData,
  id: string,
): FichaMedicaPutRequest {
  return {
    id,
    tipoSanguineo: formData.tipoSanguineo || undefined,
    necessidadesEspeciais: formData.necessidadesEspeciais || undefined,
    doencasRespiratorias: formData.doencasRespiratorias || undefined,
    alergiasAlimentares: formData.alergiasAlimentares || undefined,
    alergiasMedicamentosas: formData.alergiasMedicamentosas || undefined,
  };
}

/**
 * Mapeia os dados da ficha médica da API para o formato do formulário
 */
export function mapFichaMedicaResponseToFormData(
  fichaMedica: FichaMedicaResponse,
): FichaMedicaFormData {
  // Nota: O backend não retorna dadosPessoaisId no DTO de listagem/detalhe
  // Usamos o id da ficha como fallback (será necessário ajustar a página de edição)
  return {
    dadosPessoaisId: fichaMedica.id || "",
    tipoSanguineo: fichaMedica.tipoSanguineo || "",
    necessidadesEspeciais: fichaMedica.necessidadesEspeciais || "",
    doencasRespiratorias: fichaMedica.doencasRespiratorias || "",
    alergiasAlimentares: fichaMedica.alergiasAlimentares || "",
    alergiasMedicamentosas: fichaMedica.alergiasMedicamentosas || "",
    laudos: [],
  };
}
