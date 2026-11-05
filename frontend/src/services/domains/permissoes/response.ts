import { TelaResumoResponse } from "@/services/domains/grupo-usuario";

export interface PermissoesPerfilResponse {
  telas: string[];
  controles: string[];
}

/** GET /permissoes/me: telas e controles de quem está logado, por perfil. */
export interface PermissoesUsuarioResponse {
  gerenciaPermissoes: boolean;
  perfis: Partial<Record<string, PermissoesPerfilResponse>>;
  /** Dados de cada tela que aparece nas listas dos perfis, por código. */
  telas: Partial<Record<string, TelaResumoResponse>>;
}
