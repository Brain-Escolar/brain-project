import { httpClient } from "@/services/http";
import { AtualizacaoConteudoRequest, CadastroConteudoRequest } from "./request";
import { ConteudoResponse } from "./response";

const BASE_ROUTE = "conteudo";

export class ConteudoApi {
  criar(request: CadastroConteudoRequest): Promise<ConteudoResponse> {
    return httpClient.post(`${BASE_ROUTE}`, request);
  }

  atualizar(id: number, request: AtualizacaoConteudoRequest): Promise<ConteudoResponse> {
    return httpClient.put(`${BASE_ROUTE}/${id}`, request);
  }

  buscarPorAulaData(aulaId: number, data: string): Promise<ConteudoResponse> {
    return httpClient.get(`${BASE_ROUTE}/aula/${aulaId}/data/${data}`);
  }
}
