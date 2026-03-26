import { httpClient } from "@/services/http";
import { VerificarContaRequest } from "./request";
import { VerificarContaResponse } from "./response";

const BASE_ROUTE = "usuario";

export class UsuarioAPI {
  verificarConta(request: VerificarContaRequest): Promise<VerificarContaResponse> {
    return httpClient.get(`${BASE_ROUTE}/verificar-conta`, {
      params: request,
    });
  }
}
