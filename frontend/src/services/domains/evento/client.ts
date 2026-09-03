import { httpClient } from "@/services/http";
import { EventoResponse } from "./response";
import { EventoCreateRequest, EventoDetalheResponse, EventoUpdateRequest } from "./request";
import { IBrainResult } from "@/services/commoResponse";

const BASE_ROUTE = "evento";

export class EventoApi {
  /**
   * O backend ja aceita turmaId/serieId/unidadeId — o filtro por turma existe
   * para o responsavel ver o calendario do aluno dele, nao o da escola toda.
   */
  listar(
    dataInicio: string,
    dataFim: string,
    turmaId?: number | null,
  ): Promise<IBrainResult<EventoResponse>> {
    const params = new URLSearchParams({ dataInicio, dataFim });
    if (turmaId != null) params.set("turmaId", String(turmaId));
    return httpClient.get(`${BASE_ROUTE}?${params.toString()}`);
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
