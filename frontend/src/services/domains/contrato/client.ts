import { httpClient } from "@/services/http";
import { EfetivarMatriculaRequest } from "./request";
import { ContratoResponse, PendenciaDoPagadorResponse } from "./response";

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

  /**
   * O que falta no cadastro de quem paga, antes de efetivar.
   *
   * Mesma regra que a efetivação aplica, lida de outro jeito: a efetivação é
   * transacional e não sai pela metade, então descobrir que falta o CEP depois
   * de gerar contrato e títulos seria descobrir tarde demais.
   */
  getPendencias(simulacaoId: number): Promise<PendenciaDoPagadorResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/pendencias`, { params: { simulacaoId } });
  }

  getPorId(id: number): Promise<ContratoResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  /** Inclui rescindidos: a matrícula refeita tem mais de um contrato. */
  getDaMatricula(matriculaId: number): Promise<ContratoResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/matriculas/${matriculaId}`);
  }

  /**
   * Os contratos de um aluno, do mais recente para o mais antigo.
   *
   * É por aqui que a tela de baixa chega a uma parcela que ainda não venceu: o
   * relatório de inadimplência só lista o que está em atraso, e o caso comum é o
   * pai que paga em dia.
   */
  getDoAluno(alunoId: number, anoLetivo?: number): Promise<ContratoResponse[]> {
    return httpClient.get(BASE_ROUTE, { params: { alunoId, anoLetivo } });
  }
}
