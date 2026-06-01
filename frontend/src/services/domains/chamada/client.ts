import { httpClient } from "@/services/http";
import { AtualizacaoChamadaLoteRequest, CadastroChamadaRequest } from "./request";
import { ChamadaResponse } from "./response";

const BASE_ROUTE = "chamada";

export class ChamadaApi {
  cadastrar(request: CadastroChamadaRequest): Promise<ChamadaResponse[]> {
    return httpClient.post(`${BASE_ROUTE}`, request);
  }

  buscarPorAulaData(aulaId: number, data: string): Promise<ChamadaResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/aula/${aulaId}/data/${data}`);
  }

  atualizarLote(aulaId: number, data: string, request: AtualizacaoChamadaLoteRequest): Promise<ChamadaResponse[]> {
    return httpClient.put(`${BASE_ROUTE}/aula/${aulaId}/data/${data}`, request);
  }
}
