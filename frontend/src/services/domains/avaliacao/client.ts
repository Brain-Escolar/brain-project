import { IBrainResult } from "@/services/commoResponse";
import { httpClient } from "@/services/http";
import { AvaliacaoPostRequest, AvaliacaoPutRequest, SalvarNotasAvaliacaoRequest } from "./request";
import { AvaliacaoDetalhePageResponse, AvaliacaoDetalheResponse, AvaliacaoListaResponse } from "./response";

const BASE_ROUTE = "avaliacao";

export class AvaliacaoApi {
  criarAvaliacao(request: AvaliacaoPostRequest): Promise<IBrainResult<void>> {
    return httpClient.post(`${BASE_ROUTE}`, request);
  }

  getListaAvaliacoes(): Promise<IBrainResult<AvaliacaoListaResponse>> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  getAvaliacaoById(id: string): Promise<AvaliacaoDetalheResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  atualizarAvaliacao(request: AvaliacaoPutRequest): Promise<IBrainResult<void>> {
    return httpClient.put(`${BASE_ROUTE}/${request.id}`, request);
  }

  deleteAvaliacao(id: string): Promise<IBrainResult<void>> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }

  // TODO: Endpoint ainda não implementado no backend.
  // Mock temporário em: src/mocks/avaliacaoDetalhe.ts → mockAvaliacaoDetalhe
  // Quando implementado, substituir o mock no hook useAvaliacaoDetalheComAlunos por esta chamada.
  getAvaliacaoDetalheComAlunos(id: string): Promise<AvaliacaoDetalhePageResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}/detalhe`);
  }

  // TODO: Endpoint ainda não implementado no backend.
  // Mock temporário em: src/mocks/avaliacaoDetalhe.ts → mockAvaliacaoDetalhe
  // Quando implementado, substituir o mock no hook useAvaliacaoDetalheMutations por esta chamada.
  salvarNotasAvaliacao(request: SalvarNotasAvaliacaoRequest): Promise<IBrainResult<void>> {
    return httpClient.post(`${BASE_ROUTE}/${request.avaliacaoId}/notas`, request);
  }
}
