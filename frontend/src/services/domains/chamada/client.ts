import { httpClient } from "@/services/http";
import { CadastroChamadaRequest } from "./request";
import { ChamadaResponse } from "./response";

const BASE_ROUTE = "chamada";

export class ChamadaApi {
  cadastrar(request: CadastroChamadaRequest): Promise<ChamadaResponse[]> {
    return httpClient.post(`${BASE_ROUTE}`, request);
  }
}
