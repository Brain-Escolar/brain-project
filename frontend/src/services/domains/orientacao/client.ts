import { IBrainResult } from "@/services/commoResponse";
import { httpClient } from "@/services/http";
import {
  AlunoOrientacaoResponse,
  BuscaAlunosOrientacaoParams,
  InicioOrientacaoResponse,
} from "./response";

const BASE_ROUTE = "orientacao";

export class OrientacaoApi {
  getInicio(): Promise<InicioOrientacaoResponse> {
    return httpClient.get(`${BASE_ROUTE}/inicio`);
  }

  buscarAlunos(
    params: BuscaAlunosOrientacaoParams,
  ): Promise<IBrainResult<AlunoOrientacaoResponse>> {
    return httpClient.get(`${BASE_ROUTE}/alunos`, { params });
  }
}
