import { httpClient } from "@/services/http";
import { CadastroAnotacaoLoteRequest } from "./request";
import { AnotacaoResponse } from "./response";

const BASE_ROUTE = "anotacao";

export class AnotacaoApi {
  cadastrarLote(request: CadastroAnotacaoLoteRequest): Promise<AnotacaoResponse[]> {
    return httpClient.post(`${BASE_ROUTE}/lote`, request);
  }

  excluir(id: number): Promise<void> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }
}
