import { httpClient } from "@/services/http";
import { PermissoesUsuarioResponse } from "./response";

export class PermissaoApi {
  /** Chamado no login e ao recarregar a página (o layout privado monta nos dois casos). */
  minhas(): Promise<PermissoesUsuarioResponse> {
    return httpClient.get("permissoes/me");
  }
}
