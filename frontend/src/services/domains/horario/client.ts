import { httpClient } from "@/services/http";
import { HorarioDetalheResponse, HorarioListaResponse, HorarioResponse } from "./response";
import { IBrainResult } from "@/services/commoResponse";
import { HorarioPostRequest, HorarioPutRequest } from "./request";

const BASE_ROUTE = "horario";

export class HorarioApi {
  getListaHorarios(): Promise<IBrainResult<HorarioResponse>> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  getListaHorariosPaginada(): Promise<IBrainResult<HorarioListaResponse>> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  getHorarioById(id: string): Promise<HorarioDetalheResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  criarHorario(request: HorarioPostRequest): Promise<IBrainResult<void>> {
    return httpClient.post(`${BASE_ROUTE}`, request);
  }

  atualizarHorario(request: HorarioPutRequest): Promise<IBrainResult<void>> {
    return httpClient.put(`${BASE_ROUTE}/${request.id}`, request);
  }

  deleteHorario(id: string): Promise<IBrainResult<void>> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }
}
