import { httpClient } from "@/services/http";
import { ReservarBolsaRequest, TetoBolsaParams } from "./request";
import { ConcessaoBolsaResponse, TetoConcessaoResponse, TipoBolsaResponse } from "./response";

const BASE_ROUTE = "bolsas";

export class BolsaApi {
  /** Tipos ativos, para o seletor da tela de matrícula. */
  getTipos(): Promise<TipoBolsaResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/tipos`);
  }

  /** Quanto de bolsa pode ser concedido a este aluno, e por que esse é o limite. */
  getTeto(params: TetoBolsaParams): Promise<TetoConcessaoResponse> {
    return httpClient.get(`${BASE_ROUTE}/teto`, { params });
  }

  /** Concede a bolsa à proposta e segura o orçamento correspondente. */
  reservar(dados: ReservarBolsaRequest): Promise<ConcessaoBolsaResponse> {
    return httpClient.post(`${BASE_ROUTE}/reservar`, dados);
  }

  getConcessoesDaSimulacao(simulacaoId: number): Promise<ConcessaoBolsaResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/simulacoes/${simulacaoId}/concessoes`);
  }

  /** Lead perdido ou proposta refeita: devolve o orçamento ao bolo. */
  liberar(simulacaoId: number, motivo?: string): Promise<ConcessaoBolsaResponse[]> {
    return httpClient.post(`${BASE_ROUTE}/simulacoes/${simulacaoId}/liberar`, {}, {
      params: { motivo },
    });
  }
}
