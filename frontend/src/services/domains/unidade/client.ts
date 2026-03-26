import { httpClient } from "@/services/http";
import { UnidadeResponse } from "./response";
import { IBrainResult } from "@/services/commoResponse";
import { UnidadePostRequest, UnidadePutRequest } from "./request";

const BASE_ROUTE = "unidade";

export class UnidadeApi {
  criarUnidade(request: UnidadePostRequest): Promise<IBrainResult<void>> {
    return httpClient.post(`${BASE_ROUTE}`, request);
  }

  getListaUnidades(): Promise<IBrainResult<UnidadeResponse>> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  getUnidadeById(id: string): Promise<UnidadeResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  atualizarUnidade(request: UnidadePutRequest): Promise<IBrainResult<void>> {
    return httpClient.put(`${BASE_ROUTE}/${request.id}`, request);
  }

  deleteUnidade(id: string): Promise<IBrainResult<void>> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }
}
