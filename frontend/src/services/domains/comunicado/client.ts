import { IBrainResult } from "@/services/commoResponse";
import { httpClient } from "@/services/http/httpClient";
import {
  ComunicadoCreateRequest,
  ComunicadoListResponse,
  ComunicadoUpdateRequest,
} from "./response";

const BASE_ROUTE = "comunicado";

export class ComunicadoApi {
  getListaComunicados(params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<IBrainResult<ComunicadoListResponse>> {
    return httpClient.get(BASE_ROUTE, { params });
  }

  getComunicadoById(id: number): Promise<ComunicadoListResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  criarComunicado(data: ComunicadoCreateRequest, imagem?: File): Promise<ComunicadoListResponse> {
    const formData = new FormData();
    formData.append("dados", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (imagem) {
      formData.append("imagem", imagem);
    }
    return httpClient.post(BASE_ROUTE, formData);
  }

  atualizarComunicado(id: number, data: ComunicadoUpdateRequest): Promise<ComunicadoListResponse> {
    return httpClient.put(`${BASE_ROUTE}/${id}`, data);
  }

  deleteComunicado(id: number): Promise<void> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }
}
