import { httpClient } from "@/services/http";
import { PeriodosLetivosRequest } from "./request";
import { AnoLetivoResponse } from "./response";

const BASE_ROUTE = "anos-letivos";

export class AnoLetivoApi {
  listar(): Promise<AnoLetivoResponse[]> {
    return httpClient.get(BASE_ROUTE);
  }

  corrente(): Promise<AnoLetivoResponse> {
    return httpClient.get(`${BASE_ROUTE}/corrente`);
  }

  /** Os períodos nascem copiados do ano anterior, um ano à frente. */
  criar(ano: number): Promise<AnoLetivoResponse> {
    return httpClient.post(BASE_ROUTE, { ano });
  }

  salvarPeriodos(ano: number, dados: PeriodosLetivosRequest): Promise<AnoLetivoResponse> {
    return httpClient.put(`${BASE_ROUTE}/${ano}/periodos`, dados);
  }

  abrir(ano: number): Promise<AnoLetivoResponse> {
    return httpClient.post(`${BASE_ROUTE}/${ano}/abrir`);
  }
}
