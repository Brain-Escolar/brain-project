import { httpClient } from "@/services/http";
import { HoleriteResponse } from "./response";

const BASE_ROUTE = "holerite";

export class HoleriteApi {
  listarMeus(): Promise<HoleriteResponse[]> {
    return httpClient.get(`${BASE_ROUTE}/meus`);
  }
}
