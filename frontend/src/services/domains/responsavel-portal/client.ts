import { httpClient } from "@/services/http";
import { IBrainResult } from "@/services/commoResponse";
import { EventoResponse } from "@/services/domains/evento";
import { MaterialComplementarResponse } from "@/services/domains/material-complementar";
import { FichaMedicaAlunoResponse } from "@/services/domains/aluno";
import {
  EstudanteAnotacaoResponse,
  EstudanteTarefaResponse,
  RelatorioResponse,
} from "@/services/domains/estudante";
import {
  AlunoProdutoResponse,
  AlunoVinculadoResponse,
  AulaGradeResponse,
  ResponsavelLogadoResponse,
  ResumoAlunoResponse,
} from "./response";

/**
 * Portal do Responsavel.
 *
 * Namespace proprio, separado de `/responsavel` (que e o CRUD da secretaria
 * sobre a entidade Responsavel). Todas as rotas sao somente leitura: o backend
 * valida o vinculo com o aluno a cada chamada.
 */
const BASE_ROUTE = "portal-responsavel";

export class ResponsavelPortalApi {
  // ---- sessao ----

  getMeusDados(): Promise<ResponsavelLogadoResponse> {
    return httpClient.get(`${BASE_ROUTE}/me`);
  }

  getAlunosVinculados(): Promise<AlunoVinculadoResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/alunos`);
  }

  // ---- home ----

  getResumo(alunoId: number): Promise<ResumoAlunoResponse> {
    return httpClient.get(`${BASE_ROUTE}/aluno/${alunoId}/resumo`);
  }

  // ---- pedagogico ----

  getRelatorio(alunoId: number): Promise<RelatorioResponse> {
    return httpClient.get(`${BASE_ROUTE}/aluno/${alunoId}/relatorio`);
  }

  getOcorrencias(alunoId: number): Promise<EstudanteAnotacaoResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/aluno/${alunoId}/ocorrencias`);
  }

  getGradeHoraria(alunoId: number): Promise<AulaGradeResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/aluno/${alunoId}/grade-horaria`);
  }

  getTarefas(alunoId: number): Promise<IBrainResult<EstudanteTarefaResponse>> {
    return httpClient.get(`${BASE_ROUTE}/aluno/${alunoId}/tarefas`);
  }

  getMateriais(alunoId: number): Promise<MaterialComplementarResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/aluno/${alunoId}/materiais`);
  }

  getCalendario(
    alunoId: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<IBrainResult<EventoResponse>> {
    return httpClient.get(
      `${BASE_ROUTE}/aluno/${alunoId}/calendario?dataInicio=${dataInicio}&dataFim=${dataFim}`,
    );
  }

  // ---- saude e financeiro ----

  getFichaMedica(alunoId: number): Promise<FichaMedicaAlunoResponse> {
    return httpClient.get(`${BASE_ROUTE}/aluno/${alunoId}/ficha-medica`);
  }

  /** Só responde 200 se o responsável tiver a flag financeiro no backend. */
  getFinanceiro(alunoId: number): Promise<AlunoProdutoResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/aluno/${alunoId}/financeiro`);
  }
}
