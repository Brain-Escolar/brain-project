import Cookies from "js-cookie";
import { UserRoleEnum } from "@/enums";
import { parseRoles, perfilPrincipal } from "@/utils/perfis";

export { UserRoleEnum } from "@/enums";
export { parseRoles, perfilPrincipal } from "@/utils/perfis";
export type UserRole = UserRoleEnum;

export interface JWTPayload {
  iss: string;
  sub: string;
  id: number;
  name: string;
  role: string;
  dadosPessoaisId?: number;
  exp: number;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  /**
   * Perfil principal — usado para despachar dashboard, breadcrumb e rota padrão.
   * Para quem tem um perfil só (a maioria), é ele mesmo.
   */
  role: UserRoleEnum;
  /**
   * Todos os perfis da pessoa. O modelo de dados permite acumular: um professor
   * que também é responsável por um aluno tem os dois. Permissões devem olhar
   * esta lista, não `role`.
   */
  roles: UserRoleEnum[];
  /** Id de DadosPessoais do usuário logado — usado para comparar autoria (ex.: comunicados, mensagens). */
  dadosPessoaisId?: number;
  exp: number;
}

/**
 * Decodifica o JWT token e extrai as informações do usuário
 */
export function decodeToken(token: string): UserData | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    const payload: JWTPayload = JSON.parse(jsonPayload);

    const roles = parseRoles(payload.role);

    return {
      id: payload.id,
      name: payload.name,
      email: payload.sub,
      role: perfilPrincipal(roles),
      roles,
      dadosPessoaisId: payload.dadosPessoaisId,
      exp: payload.exp,
    };
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return null;
  }
}

/**
 * Verifica se o token está válido (não expirado)
 */
export function isTokenValid(token: string): boolean {
  const userData = decodeToken(token);
  if (!userData) return false;

  const currentTime = Math.floor(Date.now() / 1000);
  return userData.exp > currentTime;
}

/**
 * Obtém os dados do usuário atual a partir do cookie
 */
export function getCurrentUser(): UserData | null {
  const token = Cookies.get("token");
  if (!token) return null;

  if (!isTokenValid(token)) {
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    return null;
  }

  return decodeToken(token);
}

/**
 * Verifica se o usuário tem permissão para acessar uma rota
 */
export function hasPermission(userRole: UserRoleEnum, requiredRoles: UserRoleEnum[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Define as rotas permitidas para cada role
 */
export const ROLE_ROUTES: Record<UserRoleEnum, string[]> = {
  ESTUDANTE: [
    "/",
    "/aluno",
    "/relatorios",
    "/calendario",
    "/minhas-aulas",
    "/perfil",
    "/comunicacao",
    "/comunicados",
  ],
  PROFESSOR: [
    "/",
    "/professor",
    "/minhas-aulas",
    "/calendario",
    "/perfil",
    "/aulas",
    "/minhas-aulas",
    "/comunicados",
    "/comunicacao",
    "/tarefa",
    "/planejamento-anual",
  ],
  ADMIN: [
    "/",
    "/admin",
    "/usuarios",
    "/relatorios",
    "/configuracoes",
    "/perfil",
    "/aulas",
    "/minhas-aulas",
    "/comunicados",
    "/comunicacao",
    "/tarefa",
    "/planejamento-anual", "/aluno", "/calendario", "/minhas-aulas", "/perfil",
  ],
  SECRETARIO: ["/secretaria", "/aluno", "/perfil"],
  RESPONSAVEL: [
    "/",
    "/relatorios",
    "/ocorrencias",
    "/calendario",
    "/comunicados",
    "/comunicacao",
    "/materiais-complementares",
    // Prefixada por perfil: é uma tela diferente da /ficha-medica da escola,
    // que é formulário de cadastro. Esta é leitura, com duas escritas.
    "/responsavel/ficha-medica",
    "/financeiro",
    "/perfil",
  ],
};

/**
 * Verifica se o usuário pode acessar uma rota específica
 */
export function canAccessRoute(
  userRole: UserRoleEnum | UserRoleEnum[],
  route: string,
): boolean {
  // Quem acumula perfis pode acessar a união das rotas dos seus perfis.
  const perfis = Array.isArray(userRole) ? userRole : [userRole];
  const allowedRoutes = perfis.flatMap((perfil) => ROLE_ROUTES[perfil] ?? []);

  // Verifica se a rota exata está permitida
  if (allowedRoutes.includes(route)) return true;

  // Verifica se é uma subrota permitida
  return allowedRoutes.some(
    (allowedRoute) => route.startsWith(allowedRoute + "/") || route === allowedRoute,
  );
}

/**
 * Obtém a rota padrão baseada no role do usuário
 */
export function getDefaultRoute(userRole: UserRoleEnum): string {
  switch (userRole) {
    case "ESTUDANTE":
      return "/aluno";
    case "PROFESSOR":
      return "/";
    case "ADMIN":
      return "/admin";
    default:
      return "/";
  }
}

/**
 * Faz logout removendo os tokens
 */
export function logout(): void {
  Cookies.remove("token");
  Cookies.remove("refreshToken");
  // Remove também do localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
  window.location.href = "/login";
}

/**
 * Salva o token de acesso no localStorage
 */
export function setAccessToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
}

/**
 * Obtém o token de acesso do localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
}

/**
 * Remove o token de acesso do localStorage
 */
export function removeAccessToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
}
