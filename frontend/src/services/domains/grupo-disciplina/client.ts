import { IBrainResult } from "@/services/commoResponse";
import { httpClient } from "@/services/http";
import { GrupoDisciplinaPostRequest, GrupoDisciplinaPutRequest } from "./request";
import { GrupoDisciplinaDetalheResponse, GrupoDisciplinaListaResponse } from "./response";

const BASE_ROUTE = "grupo-disciplina";

export class GrupoDisciplinaApi {
  criarGrupoDisciplina(request: GrupoDisciplinaPostRequest): Promise<IBrainResult<void>> {
    return httpClient.post(`${BASE_ROUTE}`, request);
  }

  getListaGruposDisciplina(): Promise<IBrainResult<GrupoDisciplinaListaResponse>> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  getGrupoDisciplinaById(id: string): Promise<GrupoDisciplinaDetalheResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  atualizarGrupoDisciplina(request: GrupoDisciplinaPutRequest): Promise<IBrainResult<void>> {
    return httpClient.put(`${BASE_ROUTE}/${request.id}`, request);
  }

  deleteGrupoDisciplina(id: string): Promise<IBrainResult<void>> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }
}
