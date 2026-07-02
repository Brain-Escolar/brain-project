import { IBrainResult } from "@/services/commoResponse";
import { httpClient } from "@/services/http";
import {
  AtualizacaoAvaliacaoTurmaRequest,
  AvaliacaoPostRequest,
  AvaliacaoPutRequest,
  AvaliacaoTurmaInputRequest,
  SalvarNotasAvaliacaoTurmaRequest,
} from "./request";
import {
  AlunoAvaliacaoTurmaResponse,
  AvaliacaoDetalheResponse,
  AvaliacaoListaResponse,
  AvaliacaoTurmaResponse,
} from "./response";

const BASE_ROUTE = "avaliacao";

export class AvaliacaoApi {
  criarAvaliacao(dados: AvaliacaoPostRequest, anexos?: File[]): Promise<AvaliacaoDetalheResponse> {
    const formData = new FormData();
    formData.append("dados", new Blob([JSON.stringify(dados)], { type: "application/json" }));
    (anexos ?? []).forEach((anexo) => formData.append("anexos", anexo));
    return httpClient.post(`${BASE_ROUTE}`, formData);
  }

  getListaAvaliacoesProfessor(): Promise<IBrainResult<AvaliacaoListaResponse>> {
    return httpClient.get(`${BASE_ROUTE}/professor`);
  }

  getAvaliacaoById(id: string): Promise<AvaliacaoDetalheResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  atualizarAvaliacao(request: AvaliacaoPutRequest): Promise<AvaliacaoDetalheResponse> {
    const { id, ...dados } = request;
    return httpClient.put(`${BASE_ROUTE}/${id}`, dados);
  }

  deleteAvaliacao(id: string): Promise<void> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }

  listarTurmasDaAvaliacao(avaliacaoId: string): Promise<AvaliacaoTurmaResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/${avaliacaoId}/turmas`);
  }

  adicionarTurma(avaliacaoId: string, dados: AvaliacaoTurmaInputRequest): Promise<AvaliacaoTurmaResponse> {
    return httpClient.post(`${BASE_ROUTE}/${avaliacaoId}/turmas`, dados);
  }

  atualizarDatasTurma(
    avaliacaoTurmaId: number,
    dados: AtualizacaoAvaliacaoTurmaRequest,
  ): Promise<AvaliacaoTurmaResponse> {
    return httpClient.put(`${BASE_ROUTE}/turmas/${avaliacaoTurmaId}`, dados);
  }

  removerTurma(avaliacaoTurmaId: number): Promise<void> {
    return httpClient.delete(`${BASE_ROUTE}/turmas/${avaliacaoTurmaId}`);
  }

  getAlunosPorAvaliacaoTurma(avaliacaoTurmaId: number): Promise<AlunoAvaliacaoTurmaResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/turmas/${avaliacaoTurmaId}/alunos`);
  }

  salvarNotasAvaliacaoTurma(request: SalvarNotasAvaliacaoTurmaRequest): Promise<void> {
    return httpClient.post(`${BASE_ROUTE}/turmas/${request.avaliacaoTurmaId}/notas`, request);
  }
}
