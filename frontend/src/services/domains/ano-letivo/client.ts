import { httpClient } from "@/services/http";
import { PeriodosLetivosRequest, RematriculaRequest } from "./request";
import {
  AnoLetivoResponse,
  CopiaTurmasResponse,
  EncerramentoAnoResponse,
  PreviaEncerramentoResponse,
  RematriculaResponse,
} from "./response";

const BASE_ROUTE = "anos-letivos";

export class AnoLetivoApi {
  listar(): Promise<AnoLetivoResponse[]> {
    return httpClient.get(BASE_ROUTE);
  }

  corrente(): Promise<AnoLetivoResponse> {
    return httpClient.get(`${BASE_ROUTE}/corrente`);
  }

  /** Os períodos nascem copiados do ano anterior, um ano à frente. */
  criar(ano: number): Promise<AnoLetivoResponse> {
    return httpClient.post(BASE_ROUTE, { ano });
  }

  salvarPeriodos(ano: number, dados: PeriodosLetivosRequest): Promise<AnoLetivoResponse> {
    return httpClient.put(`${BASE_ROUTE}/${ano}/periodos`, dados);
  }

  fecharPeriodo(ano: number, sequencia: number): Promise<AnoLetivoResponse> {
    return httpClient.post(`${BASE_ROUTE}/${ano}/periodos/${sequencia}/fechar`);
  }

  reabrirPeriodo(ano: number, sequencia: number): Promise<AnoLetivoResponse> {
    return httpClient.post(`${BASE_ROUTE}/${ano}/periodos/${sequencia}/reabrir`);
  }

  previaEncerramento(ano: number): Promise<PreviaEncerramentoResponse> {
    return httpClient.get(`${BASE_ROUTE}/${ano}/encerramento`);
  }

  encerrar(ano: number): Promise<EncerramentoAnoResponse> {
    return httpClient.post(`${BASE_ROUTE}/${ano}/encerrar`);
  }

  /** Copia para `ano` as turmas de `ano - 1`. */
  copiarTurmas(ano: number): Promise<CopiaTurmasResponse> {
    return httpClient.post(`${BASE_ROUTE}/${ano}/copiar-turmas`);
  }

  /** Pré-matrículas em `ano` para quem concluiu `ano - 1`. */
  rematricular(ano: number, dados: RematriculaRequest): Promise<RematriculaResponse> {
    return httpClient.post(`${BASE_ROUTE}/${ano}/rematricular`, dados);
  }

  abrir(ano: number): Promise<AnoLetivoResponse> {
    return httpClient.post(`${BASE_ROUTE}/${ano}/abrir`);
  }
}
