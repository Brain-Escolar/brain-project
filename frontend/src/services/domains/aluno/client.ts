import { httpClient } from "@/services/http";
import { AlunoDetalheResponse, AlunoListaResponse, AnotacaoAlunoDisciplinaResponse, CursoPretendidoResponse, FichaMedicaAlunoResponse } from "./response";
import { IBrainResult } from "@/services/commoResponse";
import {
  AlunoDesmatricularRequest,
  AlunoPostRequest,
  AlunoPutRequest,
  AlunoVincularSerieRequest,
  FichaMedicaDadosClinicosRequest,
  LaudoMedicoRequest,
  MedicacaoRequest,
} from "./request";

const BASE_ROUTE = "aluno";

/** Corpo JSON da medicação — o arquivo, quando existe, vai à parte no FormData. */
function corpoMedicacao(dados: MedicacaoRequest) {
  return {
    tipoUso: dados.tipoUso,
    dataInicio: dados.dataInicio || null,
    dataFim: dados.dataFim || null,
    medicamentos: dados.medicamentos,
    observacao: dados.observacao,
  };
}

export class AlunoApi {
  criarAluno(request: AlunoPostRequest): Promise<IBrainResult<void>> {
    return httpClient.post(`${BASE_ROUTE}`, request);
  }

  getListaAlunos(): Promise<IBrainResult<AlunoListaResponse>> {
    return httpClient.get(`${BASE_ROUTE}`, { params: { size: 500 } });
  }

  getAlunoById(id: string): Promise<AlunoDetalheResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  atualizarAluno(request: AlunoPutRequest): Promise<IBrainResult<void>> {
    return httpClient.put(`${BASE_ROUTE}/${request.id}`, request);
  }

  deleteAluno(id: string): Promise<IBrainResult<void>> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }

  getLeads(): Promise<IBrainResult<AlunoListaResponse>> {
    return httpClient.get(`${BASE_ROUTE}/leads`);
  }

  getDesmatriculados(): Promise<IBrainResult<AlunoListaResponse>> {
    return httpClient.get(`${BASE_ROUTE}/desmatriculados`);
  }

  matricularAluno(id: string): Promise<AlunoDetalheResponse> {
    return httpClient.post(`${BASE_ROUTE}/matricular/${id}`, {});
  }

  vincularSerie(
    id: string,
    dados: AlunoVincularSerieRequest,
  ): Promise<AlunoDetalheResponse> {
    return httpClient.post(`${BASE_ROUTE}/vincular-serie/${id}`, dados);
  }

  desmatricularAluno(
    id: string,
    dados?: AlunoDesmatricularRequest,
  ): Promise<AlunoDetalheResponse> {
    return httpClient.post(`${BASE_ROUTE}/desmatricular/${id}`, dados ?? {});
  }

  rematricularAluno(id: string): Promise<AlunoDetalheResponse> {
    return httpClient.post(`${BASE_ROUTE}/rematricular/${id}`, {});
  }

  getFichaMedicaByAluno(alunoId: string): Promise<FichaMedicaAlunoResponse> {
    return httpClient.get(`${BASE_ROUTE}/${alunoId}/ficha-medica`);
  }

  atualizarFichaMedica(
    alunoId: string,
    dados: FichaMedicaDadosClinicosRequest,
  ): Promise<FichaMedicaAlunoResponse> {
    return httpClient.put(`${BASE_ROUTE}/${alunoId}/ficha-medica`, dados);
  }

  anexarLaudo(alunoId: string, dados: LaudoMedicoRequest): Promise<FichaMedicaAlunoResponse> {
    const formData = new FormData();
    formData.append("arquivo", dados.arquivo);
    formData.append(
      "dados",
      new Blob([JSON.stringify({ tipo: dados.tipo, observacao: dados.observacao })], {
        type: "application/json",
      }),
    );

    return httpClient.post(`${BASE_ROUTE}/${alunoId}/ficha-medica/laudos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  removerLaudo(alunoId: string, laudoId: number): Promise<FichaMedicaAlunoResponse> {
    return httpClient.delete(`${BASE_ROUTE}/${alunoId}/ficha-medica/laudos/${laudoId}`);
  }

  anexarMedicacao(alunoId: string, dados: MedicacaoRequest): Promise<FichaMedicaAlunoResponse> {
    const formData = new FormData();
    if (dados.arquivo) {
      formData.append("arquivo", dados.arquivo);
    }
    formData.append("dados", new Blob([JSON.stringify(corpoMedicacao(dados))], {
      type: "application/json",
    }));

    return httpClient.post(`${BASE_ROUTE}/${alunoId}/ficha-medica/medicacoes`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  atualizarMedicacao(
    alunoId: string,
    medicacaoId: number,
    dados: MedicacaoRequest,
  ): Promise<FichaMedicaAlunoResponse> {
    return httpClient.put(
      `${BASE_ROUTE}/${alunoId}/ficha-medica/medicacoes/${medicacaoId}`,
      corpoMedicacao(dados),
    );
  }

  removerMedicacao(alunoId: string, medicacaoId: number): Promise<FichaMedicaAlunoResponse> {
    return httpClient.delete(`${BASE_ROUTE}/${alunoId}/ficha-medica/medicacoes/${medicacaoId}`);
  }

  getAnotacoesPorDisciplina(
    alunoId: string,
    disciplinaId: string,
  ): Promise<AnotacaoAlunoDisciplinaResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/${alunoId}/anotacoes/${disciplinaId}`);
  }

  getPerfil(): Promise<AlunoDetalheResponse> {
    return httpClient.get(`${BASE_ROUTE}/perfil`);
  }

  getCursosPretendidos(): Promise<CursoPretendidoResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/cursos-pretendidos`);
  }

  atualizarCursoPretendido(cursoPretendido: string): Promise<AlunoDetalheResponse> {
    return httpClient.patch(`${BASE_ROUTE}/curso-pretendido`, { cursoPretendido });
  }
}
