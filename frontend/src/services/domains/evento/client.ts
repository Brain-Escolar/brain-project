import { httpClient } from "@/services/http";
import { EventoResponse } from "./response";
import { EventoCreateRequest, EventoDetalheResponse, EventoUpdateRequest } from "./request";
import { IBrainResult } from "@/services/commoResponse";

const BASE_ROUTE = "evento";

export class EventoApi {
  listar(dataInicio: string, dataFim: string): Promise<IBrainResult<EventoResponse>> {
    return httpClient.get(`${BASE_ROUTE}?dataInicio=${dataInicio}&dataFim=${dataFim}`);
  }

  detalhar(id: number): Promise<EventoDetalheResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  cadastrar(data: EventoCreateRequest): Promise<EventoDetalheResponse> {
    return httpClient.post(BASE_ROUTE, data);
  }

  atualizar(id: number, data: EventoUpdateRequest): Promise<EventoDetalheResponse> {
    return httpClient.put(`${BASE_ROUTE}/${id}`, data);
  }

  excluir(id: number): Promise<void> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }
}
