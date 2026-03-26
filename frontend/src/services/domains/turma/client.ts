import { IBrainResult } from "@/services/commoResponse";
import { httpClient } from "@/services/http";
import {
  TurmaPostRequest,
  TurmaPutRequest,
  TurmaVincularAlunosRequest,
  TurmaDefinirHorarioRequest,
} from "./request";
import {
  TurmaAlunoResponse,
  TurmaDetalheResponse,
  TurmaHorarioItemResponse,
  TurmaListaResponse,
  TurmaResponse,
} from "./response";

const BASE_ROUTE = "turma";

export class TurmaApi {
  getListaTurmas(): Promise<TurmaResponse[]> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  criarTurma(request: TurmaPostRequest): Promise<IBrainResult<void>> {
    return httpClient.post(`${BASE_ROUTE}`, request);
  }

  getListaTurmasPaginada(): Promise<IBrainResult<TurmaListaResponse>> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  getTurmaById(id: string): Promise<TurmaDetalheResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  atualizarTurma(request: TurmaPutRequest): Promise<IBrainResult<void>> {
    return httpClient.put(`${BASE_ROUTE}/${request.id}`, request);
  }

  deleteTurma(id: string): Promise<IBrainResult<void>> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }

  // Vincular Alunos
  getAlunosDaTurma(turmaId: string): Promise<TurmaAlunoResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/${turmaId}/alunos`);
  }

  vincularAlunos(request: TurmaVincularAlunosRequest): Promise<IBrainResult<void>> {
    return httpClient.post(`${BASE_ROUTE}/${request.turmaId}/alunos`, {
      alunoIds: request.alunoIds,
    });
  }

  desvincularAluno(turmaId: string, alunoId: string): Promise<IBrainResult<void>> {
    return httpClient.delete(`${BASE_ROUTE}/${turmaId}/alunos/${alunoId}`);
  }

  // Horários da Turma
  getHorariosDaTurma(turmaId: string): Promise<TurmaHorarioItemResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/${turmaId}/horarios`);
  }

  definirHorarios(request: TurmaDefinirHorarioRequest): Promise<IBrainResult<void>> {
    return httpClient.post(`${BASE_ROUTE}/${request.turmaId}/horarios`, {
      horarios: request.horarios,
    });
  }
}
