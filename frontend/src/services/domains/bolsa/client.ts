import { httpClient } from "@/services/http";
import {
  AprovacaoBolsaRequest,
  RejeicaoBolsaRequest,
  ReservarBolsaRequest,
  TetoBolsaParams,
} from "./request";
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

  /**
   * Concede a bolsa à proposta e segura o orçamento correspondente.
   *
   * Acima da alçada de quem chama, o backend NÃO recusa mais: devolve a
   * concessão em PENDENTE_APROVACAO, esperando quem tem alçada maior. A tela
   * precisa olhar o status da resposta, não só o 200.
   */
  reservar(dados: ReservarBolsaRequest): Promise<ConcessaoBolsaResponse> {
    return httpClient.post(`${BASE_ROUTE}/reservar`, dados);
  }

  /** A fila da direção: o que está esperando decisão, do mais antigo primeiro. */
  getPendentes(): Promise<ConcessaoBolsaResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/concessoes/pendentes`);
  }

  aprovar(concessaoId: number, decisao: AprovacaoBolsaRequest): Promise<ConcessaoBolsaResponse> {
    return httpClient.post(`${BASE_ROUTE}/concessoes/${concessaoId}/aprovar`, decisao);
  }

  rejeitar(concessaoId: number, decisao: RejeicaoBolsaRequest): Promise<ConcessaoBolsaResponse> {
    return httpClient.post(`${BASE_ROUTE}/concessoes/${concessaoId}/rejeitar`, decisao);
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
