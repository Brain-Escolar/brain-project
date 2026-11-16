import { PerfilNomeEnum } from "@/enums/PerfilNomeEnum";
import { SituacaoLogin } from "./response";

export interface VerificarContaRequest {
  codigo: string;
}

/** Filtros da lista de Usuários. Todos opcionais; combinam com "e". */
export interface FiltroUsuariosParams {
  busca?: string;
  perfil?: PerfilNomeEnum;
  grupoId?: number;
  situacao?: SituacaoLogin;
  semAcesso?: boolean;
  comAcessoIndividual?: boolean;
  page: number;
  size: number;
}

/** "Esqueci a senha": a escola vem do seletor da tela de login. */
export interface EsqueciSenhaRequest {
  email: string;
  codigoEscola: string;
}

export interface NovaSenhaRequest {
  token: string;
  novaSenha: string;
  novaSenhaConfirmacao: string;
}
