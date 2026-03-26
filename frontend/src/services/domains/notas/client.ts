import { IBrainResult } from "@/services/commoResponse";
import { httpClient } from "@/services/http";
import { NotaPostRequest, NotaPutRequest } from "./request";
import { NotaDetalheResponse, NotaListaResponse } from "./response";

const BASE_ROUTE = "notas";

export class NotaApi {
  criarNota(request: NotaPostRequest): Promise<IBrainResult<void>> {
    return httpClient.post(`${BASE_ROUTE}`, request);
  }

  getListaNotas(): Promise<IBrainResult<NotaListaResponse>> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  getNotaById(id: string): Promise<NotaDetalheResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  atualizarNota(request: NotaPutRequest): Promise<IBrainResult<void>> {
    return httpClient.put(`${BASE_ROUTE}/${request.id}`, request);
  }

  deleteNota(id: string): Promise<IBrainResult<void>> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }
}
