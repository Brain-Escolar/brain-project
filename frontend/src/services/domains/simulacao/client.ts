import { httpClient } from "@/services/http";
import { CriarSimulacaoRequest } from "./request";
import { SimulacaoResponse } from "./response";

const BASE_ROUTE = "simulacoes";

export class SimulacaoApi {
  criar(dados: CriarSimulacaoRequest): Promise<SimulacaoResponse> {
    return httpClient.post(BASE_ROUTE, dados);
  }

  getPorId(id: number): Promise<SimulacaoResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  /** As propostas de um lead do CRM, da mais recente para a mais antiga. */
  getDoProcesso(processoMatriculaId: number): Promise<SimulacaoResponse[]> {
    return httpClient.get(BASE_ROUTE, { params: { processoMatriculaId } });
  }

  getDoAluno(alunoId: number): Promise<SimulacaoResponse[]> {
    return httpClient.get(BASE_ROUTE, { params: { alunoId } });
  }
}
