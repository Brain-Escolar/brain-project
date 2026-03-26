import { IBrainResult } from "@/services/commoResponse";
import { httpClient } from "@/services/http";
import { TarefaResponse } from "./response";
import { TarefaPostRequest, TarefaPutRequest } from "./request";

const BASE_ROUTE = "tarefa";

export class TarefaApi {
  listaTodasTarefas(): Promise<IBrainResult<TarefaResponse>> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  criarTarefa(data: TarefaPostRequest): Promise<TarefaResponse> {
    return httpClient.post(`${BASE_ROUTE}`, data);
  }

  atualizarTarefa(data: TarefaPutRequest): Promise<TarefaResponse> {
    return httpClient.put(`${BASE_ROUTE}/${data.id}`, data);
  }

  deleteTarefa(id: string): Promise<void> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }

  buscarTarefa(id: string): Promise<TarefaResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  getTarefasProfessor(): Promise<IBrainResult<TarefaResponse>> {
    return httpClient.get(`${BASE_ROUTE}/professor`);
  }
}
