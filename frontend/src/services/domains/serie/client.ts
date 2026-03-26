import { IBrainResult } from "@/services/commoResponse";
import { httpClient } from "@/services/http";
import { SeriePostRequest, SeriePutRequest } from "./request";
import { SerieDetalheResponse, SerieListaResponse, SerieResponse } from "./response";

const BASE_ROUTE = "serie";

export class SerieApi {
  getListaSeries(): Promise<SerieResponse[]> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  criarSerie(request: SeriePostRequest): Promise<IBrainResult<void>> {
    return httpClient.post(`${BASE_ROUTE}`, request);
  }

  getListaSeriesPaginada(): Promise<IBrainResult<SerieListaResponse>> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  getSerieById(id: string): Promise<SerieDetalheResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  atualizarSerie(request: SeriePutRequest): Promise<IBrainResult<void>> {
    return httpClient.put(`${BASE_ROUTE}/${request.id}`, request);
  }

  deleteSerie(id: string): Promise<IBrainResult<void>> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }
}
