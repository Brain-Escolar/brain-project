import { UserRoleEnum } from "@/enums";

/**
 * Leitura da claim de perfil do JWT — sem dependência nenhuma, para poder ser
 * usada tanto no app quanto no middleware (Edge runtime).
 *
 * Existia uma cópia dessa lógica em utils/auth.ts e outra em middleware.ts, e
 * as duas tinham o mesmo defeito. Fonte única evita a próxima divergência.
 */

const PERFIS_VALIDOS = new Set<string>(Object.values(UserRoleEnum));

/**
 * Precedência do perfil principal — usado para despachar dashboard, breadcrumb
 * e rota padrão. Quem acumula perfis cai no do vínculo com a escola; as
 * capacidades dos demais continuam valendo pela lista completa.
 */
export const PRECEDENCIA_PERFIL: UserRoleEnum[] = [
  UserRoleEnum.ADMIN,
  UserRoleEnum.SECRETARIO,
  UserRoleEnum.PROFESSOR,
  UserRoleEnum.RESPONSAVEL,
  UserRoleEnum.ESTUDANTE,
];

/**
 * O backend manda a claim `role` como o toString() da lista de perfis:
 * "[ESTUDANTE]" para um, "[PROFESSOR, RESPONSAVEL]" para dois. Limpar só os
 * colchetes funciona no primeiro caso e produz uma string sem correspondência
 * no enum no segundo — a pessoa loga e fica sem menu, sem permissão e sem rota.
 */
export function parseRoles(claim: string | null | undefined): UserRoleEnum[] {
  if (!claim) return [];
  return claim
    .replace(/[[\]]/g, "")
    .split(",")
    .map((parte) => parte.trim())
    .filter((parte) => PERFIS_VALIDOS.has(parte)) as UserRoleEnum[];
}

export function perfilPrincipal(roles: UserRoleEnum[]): UserRoleEnum {
  return PRECEDENCIA_PERFIL.find((perfil) => roles.includes(perfil)) ?? roles[0];
}
