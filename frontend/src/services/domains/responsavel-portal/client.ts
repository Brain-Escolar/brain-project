import { httpClient } from "@/services/http";
import { IBrainResult } from "@/services/commoResponse";
import { EventoResponse } from "@/services/domains/evento";
import { MaterialComplementarResponse } from "@/services/domains/material-complementar";
import {
  EstudanteAnotacaoResponse,
  EstudanteTarefaResponse,
  RelatorioResponse,
} from "@/services/domains/estudante";
import {
  AlunoProdutoResponse,
  AlunoVinculadoResponse,
  AulaGradeResponse,
  FichaMedicaPortalResponse,
  LaudoResponse,
  MedicacaoResponse,
  ResponsavelLogadoResponse,
  ResumoAlunoResponse,
} from "./response";
import { MedicacaoPostRequest } from "./request";
import {
  DocumentacaoAlunoResponse,
  DocumentoResponse,
  FotoResponse,
  TipoDocumento,
  montarFormDocumento,
  montarFormFoto,
} from "@/services/domains/documento";

/**
 * Portal do Responsavel.
 *
 * Namespace proprio, separado de `/responsavel` (que e o CRUD da secretaria
 * sobre a entidade Responsavel). O backend valida o vinculo com o aluno a cada
 * chamada. Quase tudo aqui e leitura — as escritas sao inclusoes da familia:
 * medicacao, laudo, documentos de matricula e foto do aluno.
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

  getFichaMedica(alunoId: number): Promise<FichaMedicaPortalResponse> {
    return httpClient.get(`${BASE_ROUTE}/aluno/${alunoId}/ficha-medica`);
  }

  incluirMedicacao(alunoId: number, dados: MedicacaoPostRequest): Promise<MedicacaoResponse> {
    return httpClient.post(`${BASE_ROUTE}/aluno/${alunoId}/ficha-medica/medicacoes`, dados);
  }

  /**
   * Anexa um laudo. O backend avisa a Orientacao Educacional por alerta.
   * O nome da parte precisa ser "arquivo" — e o @RequestPart do controller.
   */
  anexarLaudo(alunoId: number, arquivo: File): Promise<LaudoResponse> {
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    return httpClient.post(`${BASE_ROUTE}/aluno/${alunoId}/ficha-medica/laudos`, formData);
  }

  // ---- documentos de matricula ----

  /** Checklist do aluno e do próprio responsável — nunca dos outros responsáveis. */
  getDocumentacao(alunoId: number): Promise<DocumentacaoAlunoResponse> {
    return httpClient.get(`${BASE_ROUTE}/aluno/${alunoId}/documentos`);
  }

  enviarDocumentoDoAluno(
    alunoId: number,
    tipo: TipoDocumento,
    arquivos: File[],
  ): Promise<DocumentoResponse> {
    return httpClient.post(
      `${BASE_ROUTE}/aluno/${alunoId}/documentos`,
      montarFormDocumento(tipo, arquivos),
    );
  }

  /** Documento do próprio responsável logado (identidade, CPF, comprovante). */
  enviarMeuDocumento(tipo: TipoDocumento, arquivos: File[]): Promise<DocumentoResponse> {
    return httpClient.post(`${BASE_ROUTE}/meus-documentos`, montarFormDocumento(tipo, arquivos));
  }

  atualizarFotoDoAluno(alunoId: number, foto: File): Promise<FotoResponse> {
    return httpClient.put(`${BASE_ROUTE}/aluno/${alunoId}/foto`, montarFormFoto(foto));
  }

  /** Só responde 200 se o responsável tiver a flag financeiro no backend. */
  getFinanceiro(alunoId: number): Promise<AlunoProdutoResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/aluno/${alunoId}/financeiro`);
  }
}
