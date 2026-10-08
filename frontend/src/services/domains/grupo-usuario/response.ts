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
}

export interface TelaCatalogoResponse {
  codigo: string;
  nome: string;
  rota: string;
  exibirMenu: boolean;
  controles: ControleCatalogoResponse[];
}

/** O que um grupo do perfil pode receber (o teto) e o que cada item exige. */
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
}
