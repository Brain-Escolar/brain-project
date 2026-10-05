import { httpClient } from "@/services/http";
import { EscolaLoginResponse } from "./response";

export class EscolaApi {
  // TEMPORÁRIO: rota pública do seletor de escola do login. Por estar sob
  // "login", o interceptor não envia o token (que pode estar vencido).
  listarParaLogin(): Promise<EscolaLoginResponse[]> {
    return httpClient.get("login/escolas");
  }
}
