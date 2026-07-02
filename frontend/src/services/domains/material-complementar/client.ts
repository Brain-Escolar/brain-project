import { httpClient } from "@/services/http";
import { MaterialComplementarPostRequest } from "./request";
import { MaterialComplementarResponse } from "./response";

const BASE_ROUTE = "material-complementar";

export class MaterialComplementarApi {
  cadastrar(dados: MaterialComplementarPostRequest, arquivo?: File): Promise<MaterialComplementarResponse> {
    const formData = new FormData();
    formData.append("dados", new Blob([JSON.stringify(dados)], { type: "application/json" }));
    if (arquivo) formData.append("arquivo", arquivo);
    return httpClient.post(`${BASE_ROUTE}`, formData);
  }

  listarPorProfessor(): Promise<MaterialComplementarResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/professor`);
  }

  excluir(id: number): Promise<void> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }
}
