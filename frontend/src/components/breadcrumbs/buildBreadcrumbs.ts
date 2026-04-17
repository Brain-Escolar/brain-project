import { RoutesEnum, UserRoleEnum } from "@/enums";
import {
  MODULE_CONFIG,
  RouteConfig,
  findListSibling,
  findRouteByPath,
} from "@/constants/routesConfig";

export interface BreadcrumbItem {
  label: string;
  href: string | null;
}

const HOME_PATHS: Record<UserRoleEnum, RoutesEnum> = {
  [UserRoleEnum.ADMIN]: RoutesEnum.HOME_ADMIN,
  [UserRoleEnum.PROFESSOR]: RoutesEnum.HOME,
  [UserRoleEnum.ESTUDANTE]: RoutesEnum.HOME_ESTUDANTE,
};

const ALL_HOME_PATHS = new Set<string>([
  RoutesEnum.HOME,
  RoutesEnum.HOME_ESTUDANTE,
  RoutesEnum.HOME_ADMIN,
]);

function prettifySegment(segment: string): string {
  return segment
    .split("-")
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function isHomePath(pathname: string): boolean {
  return ALL_HOME_PATHS.has(pathname);
}

/**
 * Resolve os itens do breadcrumb para uma rota.
 * Retorna `null` se não há breadcrumb a exibir (ex: página home).
 */
export function buildBreadcrumbs(
  pathname: string,
  role: UserRoleEnum,
  override?: string | null,
): BreadcrumbItem[] | null {
  if (isHomePath(pathname)) {
    return null;
  }

  const items: BreadcrumbItem[] = [
    { label: "Início", href: HOME_PATHS[role] },
  ];

  const matched = findRouteByPath(pathname);
  const moduleSource: RouteConfig | undefined =
    matched?.moduleMenu != null ? matched : findListSibling(pathname);

  if (moduleSource?.moduleMenu != null) {
    items.push({
      label: MODULE_CONFIG[moduleSource.moduleMenu].text,
      href: null,
    });
  }

  const isDetailRoute = matched != null && !matched.isShowMenu && matched.moduleMenu == null;
  if (isDetailRoute && moduleSource && moduleSource !== matched) {
    items.push({ label: moduleSource.text, href: moduleSource.router });
  }

  const lastLabel =
    override && override.trim() !== ""
      ? override
      : matched?.text ?? prettifySegment(pathname.split("/").filter(Boolean).pop() ?? "");

  items.push({ label: lastLabel, href: null });

  return items;
}
