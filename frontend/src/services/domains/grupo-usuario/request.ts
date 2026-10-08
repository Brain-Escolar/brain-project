import { PerfilNomeEnum } from "@/enums/PerfilNomeEnum";

export interface CadastroGrupoUsuarioRequest {
  perfil: PerfilNomeEnum;
  nome: string;
  descricao?: string;
}

/** O perfil não muda depois que o grupo é criado. */
export interface AtualizacaoGrupoUsuarioRequest {
  nome: string;
  descricao?: string | null;
  ativo: boolean;
}

/** Conjunto completo: substitui as telas e os controles do grupo. */
export interface AcessosGrupoUsuarioRequest {
  telas: string[];
  controles: string[];
}

export interface DuplicacaoGrupoUsuarioRequest {
  nome: string;
}

export interface AdicaoMembrosRequest {
  dadosPessoaisIds: number[];
}

export interface BuscaPessoasGrupoParams {
  busca?: string;
  page?: number;
  size?: number;
}
