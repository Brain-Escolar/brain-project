import { httpClient } from "@/services/http";
import { InformeRendimentoResponse } from "./response";

const BASE_ROUTE = "informe-rendimento";

export class InformeRendimentoApi {
  listarMeus(): Promise<InformeRendimentoResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/meus`);
  }
}
