import { PlanejamentoAnualRequest } from "@/services/domains/planejamento-anual";
import { PlanejamentoAnualFormData } from "./schema";

export function mapFormDataToPlanejamentoAnualRequest(
  data: PlanejamentoAnualFormData,
): PlanejamentoAnualRequest {
  return {
    ano: data.ano,
    planejamento: data.planejamento,
  };
}
