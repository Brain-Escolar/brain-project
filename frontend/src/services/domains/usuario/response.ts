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
  /** Seções que quem vê pode abrir, além de cabeçalho e login. */
  secoes: { acessoEfetivo: boolean; perfis: boolean };
  /** Vazio para quem não gerencia perfis. */
  perfisDeFuncao: PerfilDeFuncaoResponse[];
}

/** Uma linha da seção Perfis: conceder (se não tem) ou remover (se tem). */
export interface PerfilDeFuncaoResponse {
  perfil: PerfilNomeEnum;
  tem: boolean;
  podeAlterar: boolean;
  bloqueio: string | null;
}

export interface OrigemAcessoResponse {
  tipo: "GRUPO" | "INDIVIDUAL" | "TETO_ADMIN";
  nome: string;
}

export interface TelaEfetivaResponse {
  codigo: string;
  nome: string;
  rota: string | null;
  modulo: string | null;
  origens: OrigemAcessoResponse[];
}

export interface ControleEfetivoResponse {
  codigo: string;
  nome: string;
  tela: string | null;
  sensivel: boolean;
  origens: OrigemAcessoResponse[];
}

/** Área que o perfil abre direto no servidor, fora dos grupos. */
export interface AreaDiretaResponse {
  nome: string;
  detalhe: string;
  sensivel: boolean;
}

export interface AcessoDoPerfilResponse {
  perfil: PerfilNomeEnum;
  tetoDoAdmin: boolean;
  grupos: GrupoDoUsuarioResponse[];
  acessoIndividual: boolean;
  telas: TelaEfetivaResponse[];
  controles: ControleEfetivoResponse[];
  servidor: AreaDiretaResponse[];
}

export interface AcessoEfetivoResponse {
  dadosPessoaisId: number;
  perfis: AcessoDoPerfilResponse[];
  /** Grupos de perfis que a pessoa não tem mais: não dão nada, e voltam com o perfil. */
  gruposGuardados: GrupoDoUsuarioResponse[];
}

/** O que acontece ao conceder (concessao) ou remover um perfil. */
export interface PreviaPerfilResponse {
  perfil: PerfilNomeEnum;
  concessao: boolean;
  bloqueio: string | null;
  gruposQueVoltam: GrupoDoUsuarioResponse[];
  grupoPadrao: GrupoDoUsuarioResponse | null;
  acessoIndividualVolta: boolean;
  tetoDoAdmin: boolean;
  criaCadastroSecretario: boolean;
  ultimaComPerfil: boolean;
  leadsAtivos: number | null;
  telas: TelaEfetivaResponse[];
  controles: ControleEfetivoResponse[];
  servidor: AreaDiretaResponse[];
}

export interface InformacaoLinkSenhaResponse {
  finalidade: "DEFINIR" | "REDEFINIR";
  nome: string;
  login: string;
}
