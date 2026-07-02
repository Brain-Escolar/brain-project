import { IBrainResult } from "@/services/commoResponse";
import { httpClient } from "@/services/http";
import { TarefaLoteResponse, TarefaResponse } from "./response";
import { TarefaLotePostRequest, TarefaPostRequest, TarefaPutRequest } from "./request";

const BASE_ROUTE = "tarefa";

export class TarefaApi {
  listaTodasTarefas(): Promise<IBrainResult<TarefaResponse>> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  criarTarefa(dados: TarefaPostRequest, arquivo?: File): Promise<TarefaResponse> {
    const formData = new FormData();
    formData.append(
      "dados",
      new Blob([JSON.stringify(dados)], { type: "application/json" }),
    );
    if (arquivo) {
      formData.append("arquivo", arquivo);
    }
    return httpClient.post(`${BASE_ROUTE}`, formData);
  }

  atualizarTarefa(data: TarefaPutRequest): Promise<TarefaResponse> {
    const { id, arquivo, ...dados } = data;
    const formData = new FormData();
    formData.append("dados", new Blob([JSON.stringify(dados)], { type: "application/json" }));
    if (arquivo) {
      formData.append("arquivo", arquivo);
    }
    return httpClient.put(`${BASE_ROUTE}/${id}`, formData);
  }

  deleteTarefa(id: string): Promise<void> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }

  buscarTarefa(id: string): Promise<TarefaResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  getTarefasProfessor(historico = false): Promise<IBrainResult<TarefaResponse>> {
    return httpClient.get(`${BASE_ROUTE}/professor`, { params: { historico } });
  }

  criarTarefaLote(dados: TarefaLotePostRequest, arquivo?: File): Promise<TarefaLoteResponse> {
    const formData = new FormData();
    formData.append("dados", new Blob([JSON.stringify(dados)], { type: "application/json" }));
    if (arquivo) {
      formData.append("arquivo", arquivo);
    }
    return httpClient.post(`${BASE_ROUTE}/lote`, formData);
  }
}
