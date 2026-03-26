import { IBrainResult } from "@/services/commoResponse";
import { httpClient } from "@/services/http";
import { DisciplinaPostRequest, DisciplinaPutRequest } from "./request";
import { DisciplinaDetalheResponse, DisciplinaListaResponse } from "./response";

const BASE_ROUTE = "disciplina";

export class DisciplinaApi {
  criarDisciplina(request: DisciplinaPostRequest): Promise<IBrainResult<void>> {
    return httpClient.post(`${BASE_ROUTE}`, request);
  }

  getListaDisciplinas(): Promise<IBrainResult<DisciplinaListaResponse>> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  getDisciplinaById(id: string): Promise<DisciplinaDetalheResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  atualizarDisciplina(request: DisciplinaPutRequest): Promise<IBrainResult<void>> {
    return httpClient.put(`${BASE_ROUTE}/${request.id}`, request);
  }

  deleteDisciplina(id: string): Promise<IBrainResult<void>> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }
}
