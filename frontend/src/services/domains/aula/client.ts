import { httpClient } from "@/services/http";
import {
  AulaAlunoResponse,
  AulaInfoResponse,
  AulaListaResponse,
  AulaResponse,
  AulaAnotacaoResponse,
  ProximaAulaResponse,
  TarefaAulaResponse,
} from "./response";
import { IBrainResult } from "@/services/commoResponse";
import { AulaPostRequest, AulaPutRequest } from "./request";

const BASE_ROUTE = "aula";

export class AulaApi {
  getAula(): Promise<IBrainResult<AulaResponse>> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  getListaAulasPaginada(): Promise<IBrainResult<AulaListaResponse>> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  getAulaById(id: string): Promise<AulaInfoResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  getAulaInfo(id: string): Promise<AulaInfoResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  criarAula(request: AulaPostRequest): Promise<IBrainResult<void>> {
    return httpClient.post(`${BASE_ROUTE}`, request);
  }

  atualizarAula(request: AulaPutRequest): Promise<IBrainResult<void>> {
    return httpClient.put(`${BASE_ROUTE}/${request.id}`, request);
  }

  deleteAula(id: string): Promise<IBrainResult<void>> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }

  listaAlunosByIdAula(idAula: string): Promise<AulaAlunoResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/${idAula}/alunos`);
  }

  recuperarAnotacoes(aulaId: string, data: string): Promise<AulaAnotacaoResponse[]> {
    return httpClient.post(`${BASE_ROUTE}/${aulaId}/anotacoes`, { data });
  }

  getProximaAula(
    aulaId: string,
    data: string,
    horario: { hour: number; minute: number; second: number; nano: number },
  ): Promise<ProximaAulaResponse> {
    return httpClient.post(`${BASE_ROUTE}/${aulaId}/proxima-aula`, { data, horario });
  }

  getTarefasByAula(aulaId: string, data: string): Promise<TarefaAulaResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/${aulaId}/tarefas?data=${data}`);
  }

  getTarefasDatas(aulaId: string): Promise<string[]> {
    return httpClient.get(`${BASE_ROUTE}/${aulaId}/tarefas/datas`);
  }
}
