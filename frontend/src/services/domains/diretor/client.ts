import { httpClient } from "@/services/http";
import {
  AcompanhamentoParams,
  AcompanhamentoTurmaResponse,
  FiltrosAcompanhamentoResponse,
  InicioDiretorResponse,
} from "./response";

const BASE_ROUTE = "diretor";

export class DiretorApi {
  getInicio(): Promise<InicioDiretorResponse> {
    return httpClient.get(`${BASE_ROUTE}/inicio`);
  }

  getFiltrosAcompanhamento(): Promise<FiltrosAcompanhamentoResponse> {
    return httpClient.get(`${BASE_ROUTE}/acompanhamento-turma/filtros`);
  }

  getAcompanhamentoTurma(
    turmaId: number,
    params: AcompanhamentoParams,
  ): Promise<AcompanhamentoTurmaResponse> {
    return httpClient.get(`${BASE_ROUTE}/acompanhamento-turma/${turmaId}`, { params });
  }
}
