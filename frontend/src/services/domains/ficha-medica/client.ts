import { IBrainResult } from "@/services/commoResponse";
import { httpClient } from "@/services/http";
import { FichaMedicaResponse, ListagemArquivoResponse } from "./response";
import { FichaMedicaPostRequest, FichaMedicaPutRequest } from "./request";

const BASE_ROUTE = "ficha-medica";

export class FichaMedicaApi {
  listaTodasFichasMedicas(): Promise<IBrainResult<FichaMedicaResponse>> {
    return httpClient.get(`${BASE_ROUTE}`);
  }

  criarFichaMedica(data: FichaMedicaPostRequest): Promise<FichaMedicaResponse> {
    const formData = new FormData();
    formData.append(
      "dados",
      new Blob(
        [
          JSON.stringify({
            dadosPessoaisId: data.dadosPessoaisId,
            tipoSanguineo: data.tipoSanguineo,
            necessidadesEspeciais: data.necessidadesEspeciais,
            doencasRespiratorias: data.doencasRespiratorias,
            alergiasAlimentares: data.alergiasAlimentares,
            alergiasMedicamentosas: data.alergiasMedicamentosas,
          }),
        ],
        { type: "application/json" },
      ),
    );

    if (data.laudos && data.laudos.length > 0) {
      data.laudos.forEach((file) => {
        formData.append("laudos", file);
      });
    }

    return httpClient.post(`${BASE_ROUTE}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  atualizarFichaMedica(data: FichaMedicaPutRequest): Promise<FichaMedicaResponse> {
    return httpClient.put(`${BASE_ROUTE}/${data.id}`, data);
  }

  deleteFichaMedica(id: string): Promise<void> {
    return httpClient.delete(`${BASE_ROUTE}/${id}`);
  }

  buscarFichaMedica(id: string): Promise<FichaMedicaResponse> {
    return httpClient.get(`${BASE_ROUTE}/${id}`);
  }

  listarLaudos(
    id: string,
    params?: { page?: number; size?: number; sort?: string[] },
  ): Promise<IBrainResult<ListagemArquivoResponse>> {
    return httpClient.get(`${BASE_ROUTE}/${id}/laudos`, { params });
  }
}
