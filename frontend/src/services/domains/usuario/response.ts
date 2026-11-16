import { PerfilNomeEnum } from "@/enums/PerfilNomeEnum";

export interface VerificarContaResponse {
  sucesso: boolean;
  mensagem?: string;
}

export type SituacaoLogin = "AGUARDANDO_VERIFICACAO" | "ATIVO" | "DESATIVADO";

/** SEM_PERFIL: desmatrícula ou desligamento; volta pelo cadastro de origem. ADMINISTRATIVA: pela tela. */
export type MotivoDesativacao = "SEM_PERFIL" | "ADMINISTRATIVA";

export interface GrupoDoUsuarioResponse {
  id: number;
  nome: string;
  perfil: PerfilNomeEnum;
  ativo: boolean;
  padrao: boolean;
}

export interface UsuarioListaResponse {
  dadosPessoaisId: number;
  nome: string;
  nomeSocial?: string | null;
  email: string;
  perfis: PerfilNomeEnum[];
  grupos: GrupoDoUsuarioResponse[];
  perfisComAcessoIndividual: PerfilNomeEnum[];
  /** Perfis em que a pessoa não abre nenhuma tela: sem grupo ativo nem acesso individual. */
  perfisSemAcesso: PerfilNomeEnum[];
  situacao: SituacaoLogin;
  motivoDesativacao: MotivoDesativacao | null;
}

export interface GrupoFiltroResponse {
  id: number;
  nome: string;
  perfil: PerfilNomeEnum;
  ativo: boolean;
}

/** O que quem está vendo pode fazer agora. O servidor confere de novo em cada ação. */
export interface AcoesLoginResponse {
  desativar: boolean;
  reativar: boolean;
  reenviarVerificacao: boolean;
  enviarRedefinicao: boolean;
  /** Por que nada pode ser feito (sem permissão, o próprio login, fora do alcance). */
  bloqueio: string | null;
}

export interface OrigemCadastroResponse {
  tipo: "ALUNO" | "PROFESSOR" | "SECRETARIO" | "RESPONSAVEL";
  id: number;
}

export interface UsuarioDetalheResponse {
  dadosPessoaisId: number;
  nome: string;
  nomeSocial?: string | null;
  email: string;
  emailPessoalMascarado: string | null;
  perfis: PerfilNomeEnum[];
  situacao: SituacaoLogin;
  motivoDesativacao: MotivoDesativacao | null;
  origens: OrigemCadastroResponse[];
  acoes: AcoesLoginResponse;
}

export interface InformacaoLinkSenhaResponse {
  finalidade: "DEFINIR" | "REDEFINIR";
  nome: string;
  login: string;
}
