import { IBrainResult } from "@/services/commoResponse";
import { httpClient } from "@/services/http";
import { AlertaResponse } from "./response";
import { AlertaPostRequest, AlertaPutRequest } from "./request";

const BASE_ROUTE = "alerta";

export class AlertaApi {
  listaTodasAlertas(): Promise<IBrainResult<AlertaResponse>> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  criarAlerta(data: AlertaPostRequest): Promise<AlertaResponse> {
    return httpClient.post(`${BASE_ROUTE}`, data);
  }

  atualizarAlerta(data: AlertaPutRequest): Promise<AlertaResponse> {
    return httpClient.put(`${BASE_ROUTE}/${data.id}`, data);
  }

  deleteAlerta(id: string): Promise<void> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }

  buscarAlerta(id: string): Promise<AlertaResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  marcarComoLido(id: string): Promise<void> {
    return httpClient.patch(`${BASE_ROUTE}/${id}/marcar-como-lido`, {});
  }
}
