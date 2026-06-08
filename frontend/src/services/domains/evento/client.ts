import { httpClient } from "@/services/http";
import { EventoResponse } from "./response";
import { IBrainResult } from "@/services/commoResponse";

const BASE_ROUTE = "evento";

export class EventoApi {
  listar(dataInicio: string, dataFim: string): Promise<IBrainResult<EventoResponse>> {
    return httpClient.get(`${BASE_ROUTE}?dataInicio=${dataInicio}&dataFim=${dataFim}`);
  }
}
