import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";
import { getAllowedRoutes } from "@/constants/routesConfig";
import { UserRoleEnum } from "./enums";

interface JWTPayload {
  iss: string;
  sub: string;
  id: number;
  role: string;
  exp: number;
}

const publicRoutes = [
  { path: "/login", whenAuthenticated: "redirect" },
  { path: "/login/google/autorizado", whenAuthenticated: "next" },
  { path: "/usuario/verificar-conta", whenAuthenticated: "next" },
  { path: "/register", whenAuthenticated: "redirect" },
  { path: "/teste-ssr", whenAuthenticated: "next" },
  { path: "/princing", whenAuthenticated: "next" },
] as const;

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = "/login";

function decodeToken(token: string): { role: UserRoleEnum; exp: number } | null {
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
    const role = payload.role.replace(/[\[\]]/g, "") as UserRoleEnum;

    return {
      role,
      exp: payload.exp,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

function canAccessRoute(userRole: UserRoleEnum, route: string): boolean {
  const allowedRoutes = getAllowedRoutes(userRole);

  if (allowedRoutes.includes(route)) return true;
  return allowedRoutes.some(
    (allowedRoute) => route.startsWith(allowedRoute + "/") || route === allowedRoute,
  );
}

function getDefaultRoute(userRole: UserRoleEnum): string {
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

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicRoute = publicRoutes.find((route) => route.path === path);
  const authToken = request.cookies.get("token");

  if (!authToken && publicRoute) {
    return NextResponse.next();
  }

  if (!authToken && !publicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    return NextResponse.redirect(redirectUrl);
  }

  if (authToken && publicRoute && publicRoute.whenAuthenticated === "redirect") {
    // Decodifica o token para obter o role
    const tokenData = decodeToken(authToken.value);
    if (tokenData) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = getDefaultRoute(tokenData.role);
      return NextResponse.redirect(redirectUrl);
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  if (authToken && !publicRoute) {
    // Verifica se o token é válido
    const tokenData = decodeToken(authToken.value);

    if (!tokenData) {
      // Token inválido, redireciona para login
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
      const response = NextResponse.redirect(redirectUrl);
      response.cookies.delete("token");
      response.cookies.delete("refreshToken");
      return response;
    }

    // Verifica se o token não expirou
    const currentTime = Math.floor(Date.now() / 1000);
    if (tokenData.exp <= currentTime) {
      // Token expirado, redireciona para login
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
      const response = NextResponse.redirect(redirectUrl);
      response.cookies.delete("token");
      response.cookies.delete("refreshToken");
      return response;
    }

    // Verifica se o usuário tem permissão para acessar a rota
    if (!canAccessRoute(tokenData.role, path)) {
      // Redireciona para a rota padrão do role apenas se não tiver permissão
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = getDefaultRoute(tokenData.role);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config: MiddlewareConfig = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
