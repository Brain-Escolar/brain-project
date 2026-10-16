import { PerfilNomeEnum } from "@/enums/PerfilNomeEnum";

export interface GrupoUsuarioListaResponse {
  id: number;
  nome: string;
  descricao: string | null;
  perfil: PerfilNomeEnum;
  padrao: boolean;
  ativo: boolean;
  quantidadeMembros: number;
  quantidadeTelas: number;
  quantidadeControles: number;
}

/** Grupo com os códigos concedidos; a tela cruza com o catálogo do perfil. */
export interface GrupoUsuarioDetalheResponse {
  id: number;
  nome: string;
  descricao: string | null;
  perfil: PerfilNomeEnum;
  padrao: boolean;
  ativo: boolean;
  quantidadeMembros: number;
  telas: string[];
  controles: string[];
}

export interface ControleCatalogoResponse {
  codigo: string;
  nome: string;
  descricao: string | null;
  /** Falso só no catálogo do acesso individual, para o que é de fora do teto do perfil. */
  doPerfil: boolean;
  /** Dado sensível (situação familiar, atendimento psicológico): a linha leva um aviso. */
  sensivel: boolean;
}

export interface TelaCatalogoResponse {
  codigo: string;
  nome: string;
  rota: string;
  exibirMenu: boolean;
  /** Falso só no catálogo do acesso individual, para as telas de fora do teto do perfil. */
  doPerfil: boolean;
  controles: ControleCatalogoResponse[];
}

/**
 * O que pode ser concedido e o que cada item exige: o teto do perfil, para um
 * grupo, ou o sistema inteiro, para o acesso individual.
 */
export interface CatalogoPermissoesResponse {
  perfil: PerfilNomeEnum;
  telas: TelaCatalogoResponse[];
  controlesGerais: ControleCatalogoResponse[];
  dependencias: Record<string, string[]>;
}

/** email é o login; nulo para quem não acessa o sistema. */
export interface PessoaGrupoResponse {
  dadosPessoaisId: number;
  nome: string;
  email: string | null;
  /** Só na lista de membros: telas e controles além dos grupos, no perfil do grupo. */
  acessosIndividuais?: number;
}

export interface GrupoDaPessoaResponse {
  id: number;
  nome: string;
  ativo: boolean;
}

/** Tela do catálogo, para a busca da aba "Por tela" (independe de perfil). */
export interface TelaResumoResponse {
  codigo: string;
  nome: string;
  rota: string;
}

/**
 * Grupo ou acesso individual que libera uma tela. Com individual=true, nome
 * é o da pessoa, e não do grupo.
 */
export interface AcessoATelaResponse {
  grupoId: number;
  nome: string;
  perfil: PerfilNomeEnum;
  individual: boolean;
  ativo: boolean;
  quantidadeMembros: number;
}

/**
 * Acessos individuais de uma pessoa num perfil. telas e controles são os
 * individuais; herdados vai de cada código que os grupos ativos dela já dão
 * aos nomes desses grupos.
 */
export interface AcessosIndividuaisResponse {
  dadosPessoaisId: number;
  nome: string;
  email: string | null;
  perfil: PerfilNomeEnum;
  grupos: GrupoDaPessoaResponse[];
  herdados: Record<string, string[]>;
  telas: string[];
  controles: string[];
}
