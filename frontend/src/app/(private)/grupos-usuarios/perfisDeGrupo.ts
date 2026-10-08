import { PERFIL_DISPLAY_NAME, PerfilNomeEnum } from "@/enums/PerfilNomeEnum";

/**
 * Perfis que usam grupos, na ordem da tela: a equipe da escola primeiro. O
 * ADMIN fica de fora porque não passa por grupos (recebe o teto do perfil).
 */
export const PERFIS_COM_GRUPO: PerfilNomeEnum[] = [
  PerfilNomeEnum.DIRETOR,
  PerfilNomeEnum.COORDENADOR,
  PerfilNomeEnum.SECRETARIO,
  PerfilNomeEnum.ORIENTADOR,
  PerfilNomeEnum.PROFESSOR,
  PerfilNomeEnum.RECURSOS_HUMANOS,
  PerfilNomeEnum.RESPONSAVEL,
  PerfilNomeEnum.ESTUDANTE,
];

export function nomeDoPerfil(perfil: PerfilNomeEnum): string {
  return PERFIL_DISPLAY_NAME[perfil] ?? perfil;
}
