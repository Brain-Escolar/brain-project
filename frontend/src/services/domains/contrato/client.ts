import { httpClient } from "@/services/http";
import { EfetivarMatriculaRequest } from "./request";
import { ContratoResponse } from "./response";

const BASE_ROUTE = "contratos";

export class ContratoApi {
  /**
   * Cria matrícula, contrato, itens e títulos a partir da proposta, e transforma
   * a reserva de bolsa em compromisso. Tudo numa transação no backend: ou sai
   * tudo, ou não sai nada.
   */
  efetivar(dados: EfetivarMatriculaRequest): Promise<ContratoResponse> {
    return httpClient.post(`${BASE_ROUTE}/efetivar`, dados);
  }

  getPorId(id: number): Promise<ContratoResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  /** Inclui rescindidos: a matrícula refeita tem mais de um contrato. */
  getDaMatricula(matriculaId: number): Promise<ContratoResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/matriculas/${matriculaId}`);
  }
}
