import { httpClient } from "@/services/http";
import {
  AcompanhamentoParams,
  AcompanhamentoProfessorResponse,
  AcompanhamentoTurmaResponse,
  FiltrosAcompanhamentoResponse,
  InicioDiretorResponse,
  LembretesEnviadosResponse,
  ProfessoresDiretorResponse,
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

  getProfessores(): Promise<ProfessoresDiretorResponse> {
    return httpClient.get(`${BASE_ROUTE}/professores`);
  }

  /** `semana`: um dia (yyyy-MM-dd) da semana do diário; sem ele, a semana atual. */
  getAcompanhamentoProfessor(
    professorId: number,
    semana?: string,
  ): Promise<AcompanhamentoProfessorResponse> {
    return httpClient.get(`${BASE_ROUTE}/professores/${professorId}`, {
      params: semana ? { semana } : undefined,
    });
  }

  /** Sem ids, lembra todos os professores com pendência. */
  lembrarProfessores(professorIds?: number[]): Promise<LembretesEnviadosResponse> {
    return httpClient.post(`${BASE_ROUTE}/professores/lembretes`, { professorIds: professorIds ?? null });
  }
}
