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

  criarComunicado(data: ComunicadoCreateRequest): Promise<ComunicadoListResponse> {
    return httpClient.post(BASE_ROUTE, data);
  }

  atualizarComunicado(id: number, data: ComunicadoUpdateRequest): Promise<ComunicadoListResponse> {
    return httpClient.put(`${BASE_ROUTE}/${id}`, data);
  }

  deleteComunicado(id: number): Promise<void> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }
}
