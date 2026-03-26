import { httpClient } from "@/services/http";
import { AlunoDetalheResponse, AlunoListaResponse } from "./response";
import { IBrainResult } from "@/services/commoResponse";
import {
  AlunoPostRequest,
  AlunoPutRequest,
  AlunoVincularSerieRequest,
} from "./request";

const BASE_ROUTE = "aluno";

export class AlunoApi {
  criarAluno(request: AlunoPostRequest): Promise<IBrainResult<void>> {
    return httpClient.post(`${BASE_ROUTE}`, request);
  }

  getListaAlunos(): Promise<IBrainResult<AlunoListaResponse>> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  getAlunoById(id: string): Promise<AlunoDetalheResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  atualizarAluno(request: AlunoPutRequest): Promise<IBrainResult<void>> {
    return httpClient.put(`${BASE_ROUTE}/${request.id}`, request);
  }

  deleteAluno(id: string): Promise<IBrainResult<void>> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }

  getLeads(): Promise<IBrainResult<AlunoListaResponse>> {
    return httpClient.get(`${BASE_ROUTE}/leads`);
  }

  matricularAluno(id: string): Promise<AlunoDetalheResponse> {
    return httpClient.post(`${BASE_ROUTE}/matricular/${id}`, {});
  }

  vincularSerie(
    id: string,
    dados: AlunoVincularSerieRequest,
  ): Promise<AlunoDetalheResponse> {
    return httpClient.post(`${BASE_ROUTE}/vincular-serie/${id}`, dados);
  }

  desmatricularAluno(id: string): Promise<AlunoDetalheResponse> {
    return httpClient.post(`${BASE_ROUTE}/desmatricular/${id}`, {});
  }
}
