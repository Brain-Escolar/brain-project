import { httpClient } from "@/services/http";
import { BaixaRequest, EstornoRequest } from "./request";
import { BaixaResponse, InadimplenciaResponse, PagamentoResponse } from "./response";

const BASE_ROUTE = "financeiro";

export interface FiltroInadimplencia {
  unidadeId?: number;
  anoLetivo?: number;
  /** Permite reabrir o fechamento de um mês passado com os números daquele dia. */
  referencia?: string;
}

export class FinanceiroApi {
  baixar(tituloId: number, dados: BaixaRequest): Promise<BaixaResponse> {
    return httpClient.post(`${BASE_ROUTE}/titulos/${tituloId}/baixa`, dados);
  }

  estornar(pagamentoId: number, dados: EstornoRequest): Promise<BaixaResponse> {
    return httpClient.post(`${BASE_ROUTE}/pagamentos/${pagamentoId}/estorno`, dados);
  }

  /** Histórico de baixas da parcela, estornadas inclusive. */
  getPagamentosDoTitulo(tituloId: number): Promise<PagamentoResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/titulos/${tituloId}/pagamentos`);
  }

  /** Conferência de caixa: o que entrou numa data, estornos de fora. */
  getCaixaDoDia(data?: string): Promise<PagamentoResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/caixa`, { params: data ? { data } : undefined });
  }

  getInadimplencia(filtro?: FiltroInadimplencia): Promise<InadimplenciaResponse> {
    return httpClient.get(`${BASE_ROUTE}/inadimplencia`, { params: filtro });
  }
}
