import { IBrainResult } from "@/services/commoResponse";
import { httpClient } from "@/services/http";
import { MaterialComplementarResponse } from "@/services/domains/material-complementar";
import { EstudanteAulaRequest } from "./request";
import {
  RelatorioResponse,
  EstudanteAnotacaoResponse,
  EstudanteAulaResponse,
  EstudanteTarefaResponse,
} from "./response";

const BASE_ROUTE = "aluno";

export class EstudanteApi {
  getAulasAluno(request: EstudanteAulaRequest): Promise<IBrainResult<EstudanteAulaResponse>> {
    return httpClient.post(`${BASE_ROUTE}/aulas`, request);
  }

  getAulasSemanalAluno(): Promise<EstudanteAulaResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/aulas/semana`);
  }

  getAnotacoesSemana(): Promise<EstudanteAnotacaoResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/anotacoes/semana`);
  }

  getTarefasAluno(): Promise<IBrainResult<EstudanteTarefaResponse>> {
    return httpClient.get(`${BASE_ROUTE}/tarefas`);
  }

  getMateriaisComplementares(): Promise<MaterialComplementarResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/materiais-complementares`);
  }

  getRelatorio(): Promise<RelatorioResponse> {
    // RelatoriosController é um recurso independente, montado em `/relatorios` (não sob `/aluno`).
    return httpClient.get("relatorios");
  }
}
