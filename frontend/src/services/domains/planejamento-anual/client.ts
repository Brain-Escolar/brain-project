import { httpClient } from "@/services/http";
import { IBrainResult } from "@/services/commoResponse";
import { PlanejamentoAnualRequest } from "./request";
import { ListagemPlanejamentoAnualResponse, PlanejamentoAnualResponse } from "./response";

const BASE_ROUTE = "planejamento-anual";

export class PlanejamentoAnualAPI {
  cadastrar(request: PlanejamentoAnualRequest): Promise<PlanejamentoAnualResponse> {
    const formData = new FormData();

    formData.append(
      "dados",
      new Blob([JSON.stringify({ ano: request.ano })], { type: "application/json" }),
    );

    formData.append("planejamento", request.planejamento);

    return httpClient.post(`${BASE_ROUTE}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  listar(): Promise<IBrainResult<ListagemPlanejamentoAnualResponse>> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  recuperarPorAno(ano: number): Promise<PlanejamentoAnualResponse> {
    return httpClient.get(`${BASE_ROUTE}/${ano}`);
  }
}
