import { httpClient } from "@/services/http";
import { BoletimParams } from "./request";
import { BoletimResponse, HistoricoResponse } from "./response";

const BASE_ROUTE = "documentos-escolares";

/** Boletim e histórico escolar emitidos pela secretaria. */
export class DocumentoEscolarApi {
  getBoletim(alunoId: number, params?: BoletimParams): Promise<BoletimResponse> {
    return httpClient.get(`${BASE_ROUTE}/aluno/${alunoId}/boletim`, { params });
  }

  getHistorico(alunoId: number): Promise<HistoricoResponse> {
    return httpClient.get(`${BASE_ROUTE}/aluno/${alunoId}/historico`);
  }
}
