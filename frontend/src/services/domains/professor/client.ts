import { IBrainResult } from "@/services/commoResponse";
import { httpClient } from "@/services/http";
import {
  ProfessorAulaRequest,
  ProfessorPostRequest,
  ProfessorPutRequest,
  ProfessorCadastroDisponibilidadeRequest,
  ProfessorAtualizacaoDisponibilidadeRequest,
} from "./request";
import {
  ProfessorAulaResponse,
  ProfessorAulaSemanalResponse,
  ProfessorDetalheResponse,
  ProfessorListaResponse,
  ProfessorPlanejamentoResponse,
  ProfessorDisponibilidadeResponse,
  ProfessorMultipleUrisResponse,
  DisciplinaTurmasProfessorResponse,
  DetalheTurmaProfessorResponse,
} from "./response";

const BASE_ROUTE = "professor";

export class ProfessorApi {
  getAulasProfessor(request: ProfessorAulaRequest): Promise<IBrainResult<ProfessorAulaResponse>> {
    return httpClient.post(`${BASE_ROUTE}/aulas`, request);
  }

  getAulasSemanalProfessor(): Promise<ProfessorAulaSemanalResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/aulas/semana`);
  }
  getPlanejamento(): Promise<IBrainResult<ProfessorPlanejamentoResponse>> {
    return httpClient.get(`${BASE_ROUTE}/planejamento`);
  }
  criarProfessor(request: ProfessorPostRequest): Promise<IBrainResult<void>> {
    return httpClient.post(`${BASE_ROUTE}`, request);
  }
  getListaProfessores(): Promise<IBrainResult<ProfessorListaResponse>> {
    return httpClient.get(`${BASE_ROUTE}`);
  }
  getProfessorById(id: string): Promise<ProfessorDetalheResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }
  atualizarProfessor(request: ProfessorPutRequest): Promise<IBrainResult<void>> {
    return httpClient.put(`${BASE_ROUTE}/${request.id}`, request);
  }
  deleteProfessor(id: string): Promise<IBrainResult<void>> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }

  reativarProfessor(id: string): Promise<ProfessorDetalheResponse> {
    return httpClient.get(`${BASE_ROUTE}/reativar/${id}`);
  }

  cadastrarDisponibilidade(
    professorId: string,
    dados: ProfessorCadastroDisponibilidadeRequest,
  ): Promise<ProfessorMultipleUrisResponse[]> {
    return httpClient.post(`${BASE_ROUTE}/${professorId}/disponibilidade`, dados);
  }

  listarDisponibilidade(
    professorId: string,
  ): Promise<IBrainResult<ProfessorDisponibilidadeResponse>> {
    return httpClient.get(`${BASE_ROUTE}/${professorId}/disponibilidade`);
  }

  atualizarDisponibilidade(
    id: string,
    dados: ProfessorAtualizacaoDisponibilidadeRequest,
  ): Promise<ProfessorDisponibilidadeResponse> {
    return httpClient.put(`${BASE_ROUTE}/disponibilidade/${id}`, dados);
  }

  excluirDisponibilidade(id: string): Promise<void> {
    return httpClient.delete(`${BASE_ROUTE}/disponibilidade/${id}`);
  }

  getMinhasTurmas(): Promise<DisciplinaTurmasProfessorResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/turmas`);
  }

  getTurmaAlunos(turmaId: string, disciplinaId: string): Promise<DetalheTurmaProfessorResponse> {
    return httpClient.get(`${BASE_ROUTE}/turmas/${turmaId}/disciplina/${disciplinaId}/alunos`);
  }
}
