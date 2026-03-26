import { IBrainResult } from "@/services/commoResponse";
import { httpClient } from "@/services/http";
import {
  GradeCurricularPostRequest,
  GradeCurricularPutRequest,
  GradeCurricularAdicionarDisciplinasRequest,
} from "./request";
import {
  GradeCurricularDetalheResponse,
  GradeCurricularListaResponse,
} from "./response";

const BASE_ROUTE = "grade-curricular";

export class GradeCurricularApi {
  getListaGradesCurriculares(): Promise<IBrainResult<GradeCurricularListaResponse>> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  getGradeCurricularById(id: string): Promise<GradeCurricularDetalheResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  criarGradeCurricular(request: GradeCurricularPostRequest): Promise<IBrainResult<void>> {
    return httpClient.post(`${BASE_ROUTE}`, request);
  }

  atualizarGradeCurricular(request: GradeCurricularPutRequest): Promise<IBrainResult<void>> {
    return httpClient.put(`${BASE_ROUTE}/${request.id}`, request);
  }

  deleteGradeCurricular(id: string): Promise<IBrainResult<void>> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }

  desativarGradeCurricular(id: string): Promise<GradeCurricularDetalheResponse> {
    return httpClient.get(`${BASE_ROUTE}/desativar/${id}`);
  }

  adicionarDisciplinas(
    dados: GradeCurricularAdicionarDisciplinasRequest,
  ): Promise<GradeCurricularDetalheResponse> {
    return httpClient.post(`${BASE_ROUTE}/disciplinas`, dados);
  }
}
