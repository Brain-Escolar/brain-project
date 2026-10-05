import { httpClient } from "@/services/http";
import { EscolaResponse } from "./response";

const BASE_ROUTE = "escola";

export class EscolaApi {
  listar(): Promise<EscolaResponse[]> {
    return httpClient.get(`${BASE_ROUTE}`);
  }
}
