import { IBrainResult } from "@/services/commoResponse";
import { httpClient } from "@/services/http";
import { EstudanteAulaRequest } from "./request";
import { EstudanteAnotacaoResponse, EstudanteAulaResponse, EstudanteTarefaResponse } from "./response";

const BASE_ROUTE = "aluno";

export class EstudanteApi {
  getAulasAluno(request: EstudanteAulaRequest): Promise<IBrainResult<EstudanteAulaResponse>> {
    return httpClient.post(`${BASE_ROUTE}/aulas`, request);
  }

  getAnotacoesSemana(): Promise<EstudanteAnotacaoResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/anotacoes/semana`);
  }

  getTarefasAluno(): Promise<IBrainResult<EstudanteTarefaResponse>> {
    return httpClient.get(`${BASE_ROUTE}/tarefas`);
  }
}
