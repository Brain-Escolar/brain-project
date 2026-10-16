export interface PermissoesPerfilResponse {
  telas: string[];
  controles: string[];
}

/** GET /permissoes/me: telas e controles de quem está logado, por perfil. */
export interface PermissoesUsuarioResponse {
  gerenciaPermissoes: boolean;
  perfis: Partial<Record<string, PermissoesPerfilResponse>>;
}
