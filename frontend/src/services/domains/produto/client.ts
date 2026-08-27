import { httpClient } from "@/services/http";
import { AlunoProdutoResponse } from "./response";

const BASE_ROUTE = "produto";

export class ProdutoApi {
  listarComprasPorAluno(alunoId: string): Promise<AlunoProdutoResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/alunos/${alunoId}`);
  }
}
