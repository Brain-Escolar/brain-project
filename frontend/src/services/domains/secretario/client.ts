import { IBrainResult } from "@/services/commoResponse";
import { httpClient } from "@/services/http";
import { SecretarioPostRequest } from "./request";
import { SecretarioListaResponse } from "./response";

const BASE_ROUTE = "secretario";

export class SecretarioApi {
  criarSecretario(request: SecretarioPostRequest): Promise<SecretarioListaResponse> {
    return httpClient.post(`${BASE_ROUTE}`, request);
  }
  getListaSecretarios(): Promise<IBrainResult<SecretarioListaResponse>> {
    return httpClient.get(`${BASE_ROUTE}`, { params: { size: 500 } });
  }
  deleteSecretario(id: string): Promise<void> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }
}
