import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import SchoolIcon from "@mui/icons-material/School";
import ClassIcon from "@mui/icons-material/Class";
import ScheduleIcon from "@mui/icons-material/Schedule";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import GradeIcon from "@mui/icons-material/Grade";
import CategoryIcon from "@mui/icons-material/Category";
import FolderIcon from "@mui/icons-material/Folder";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import * as React from "react";
import { UserRoleEnum, RoutesEnum, RouteLabelsEnum, RoutesModuleEnum } from "@/enums";

export interface RouteConfig {
  text: RouteLabelsEnum;
  icon: React.JSX.Element;
  router: RoutesEnum;
  isShowMenu: boolean;
  roles: UserRoleEnum[];
  moduleMenu?: RoutesModuleEnum | null;
}

export interface MenuModule {
  id: RoutesModuleEnum;
  text: string;
  icon: React.JSX.Element;
  roles: UserRoleEnum[];
}

export const MODULE_CONFIG: Record<RoutesModuleEnum, { text: string; icon: React.JSX.Element }> = {
  [RoutesModuleEnum.CADASTROS]: {
    text: "Cadastros",
    icon: <FolderIcon fontSize="small" />,
  },
};

export const ROUTES: RouteConfig[] = [
  {
    text: RouteLabelsEnum.HOME_DASHBOARD,
    icon: <DashboardIcon fontSize="small" />,
    router: RoutesEnum.HOME,
    isShowMenu: true,
    roles: [UserRoleEnum.PROFESSOR],
  },
  {
    text: RouteLabelsEnum.HOME_ESTUDANTE,
    icon: <DashboardIcon fontSize="small" />,
    router: RoutesEnum.HOME_ESTUDANTE,
    isShowMenu: true,
    roles: [UserRoleEnum.ESTUDANTE],
  },
  {
    text: RouteLabelsEnum.HOME_ADMIN,
    icon: <DashboardIcon fontSize="small" />,
    router: RoutesEnum.HOME_ADMIN,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
  },
  // ========== CADASTROS - APENAS ADMIN ==========
  {
    text: RouteLabelsEnum.PROFESSORES,
    icon: <PersonIcon fontSize="small" />,
    router: RoutesEnum.PROFESSOR_LISTA,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
    moduleMenu: RoutesModuleEnum.CADASTROS,
  },
  {
    text: RouteLabelsEnum.PROFESSOR,
    icon: <PersonIcon fontSize="small" />,
    router: RoutesEnum.PROFESSOR,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.TURMAS,
    icon: <GroupIcon fontSize="small" />,
    router: RoutesEnum.TURMA_LISTA,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
    moduleMenu: RoutesModuleEnum.CADASTROS,
  },
  {
    text: RouteLabelsEnum.TURMA,
    icon: <GroupIcon fontSize="small" />,
    router: RoutesEnum.TURMA,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.TURMA_VINCULAR_ALUNOS,
    icon: <GroupIcon fontSize="small" />,
    router: RoutesEnum.TURMA_VINCULAR_ALUNOS,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.TURMA_DEFINIR_HORARIOS,
    icon: <ScheduleIcon fontSize="small" />,
    router: RoutesEnum.TURMA_DEFINIR_HORARIOS,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.GRADES_CURRICULARES,
    icon: <MenuBookIcon fontSize="small" />,
    router: RoutesEnum.GRADE_CURRICULAR_LISTA,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
    moduleMenu: RoutesModuleEnum.CADASTROS,
  },
  {
    text: RouteLabelsEnum.GRADE_CURRICULAR,
    icon: <MenuBookIcon fontSize="small" />,
    router: RoutesEnum.GRADE_CURRICULAR,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.GRUPOS_DISCIPLINA,
    icon: <CategoryIcon fontSize="small" />,
    router: RoutesEnum.GRUPO_DISCIPLINA_LISTA,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
    moduleMenu: RoutesModuleEnum.CADASTROS,
  },
  {
    text: RouteLabelsEnum.GRUPO_DISCIPLINA,
    icon: <CategoryIcon fontSize="small" />,
    router: RoutesEnum.GRUPO_DISCIPLINA,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.DISCIPLINAS,
    icon: <MenuBookIcon fontSize="small" />,
    router: RoutesEnum.DISCIPLINA_LISTA,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
    moduleMenu: RoutesModuleEnum.CADASTROS,
  },
  {
    text: RouteLabelsEnum.DISCIPLINA,
    icon: <MenuBookIcon fontSize="small" />,
    router: RoutesEnum.DISCIPLINA,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.SERIES,
    icon: <SchoolIcon fontSize="small" />,
    router: RoutesEnum.SERIE_LISTA,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
    moduleMenu: RoutesModuleEnum.CADASTROS,
  },
  {
    text: RouteLabelsEnum.SERIE,
    icon: <SchoolIcon fontSize="small" />,
    router: RoutesEnum.SERIE,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.AULAS,
    icon: <ClassIcon fontSize="small" />,
    router: RoutesEnum.AULA_LISTA,
    isShowMenu: true,
    moduleMenu: RoutesModuleEnum.CADASTROS,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.AULAS,
    icon: <ClassIcon fontSize="small" />,
    router: RoutesEnum.AULAS_DETALHE,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.AULA,
    icon: <ClassIcon fontSize="small" />,
    router: RoutesEnum.AULA,
    isShowMenu: false,
    roles: [UserRoleEnum.PROFESSOR, UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.HORARIOS,
    icon: <ScheduleIcon fontSize="small" />,
    router: RoutesEnum.HORARIO_LISTA,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
    moduleMenu: RoutesModuleEnum.CADASTROS,
  },
  {
    text: RouteLabelsEnum.HORARIO,
    icon: <ScheduleIcon fontSize="small" />,
    router: RoutesEnum.HORARIO,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.AVALIACOES_CADASTRO,
    icon: <AssessmentIcon fontSize="small" />,
    router: RoutesEnum.AVALIACAO_LISTA,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
    moduleMenu: RoutesModuleEnum.CADASTROS,
  },
  {
    text: RouteLabelsEnum.AVALIACAO,
    icon: <AssessmentIcon fontSize="small" />,
    router: RoutesEnum.AVALIACAO,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.NOTAS,
    icon: <GradeIcon fontSize="small" />,
    router: RoutesEnum.NOTA_LISTA,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
    moduleMenu: RoutesModuleEnum.CADASTROS,
  },
  {
    text: RouteLabelsEnum.NOTA,
    icon: <GradeIcon fontSize="small" />,
    router: RoutesEnum.NOTA,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.TAREFA_LISTA,
    icon: <AssignmentIcon fontSize="small" />,
    router: RoutesEnum.TAREFA_LISTA,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
    moduleMenu: RoutesModuleEnum.CADASTROS,
  },
  {
    text: RouteLabelsEnum.TAREFA,
    icon: <AssignmentIcon fontSize="small" />,
    router: RoutesEnum.TAREFA,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.ALERTA_LISTA,
    icon: <AnnouncementIcon fontSize="small" />,
    router: RoutesEnum.ALERTA_LISTA,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
    moduleMenu: RoutesModuleEnum.CADASTROS,
  },
  {
    text: RouteLabelsEnum.ALERTA,
    icon: <AnnouncementIcon fontSize="small" />,
    router: RoutesEnum.ALERTA,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.FICHA_MEDICA_LISTA,
    icon: <LocalHospitalIcon fontSize="small" />,
    router: RoutesEnum.FICHA_MEDICA_LISTA,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
    moduleMenu: RoutesModuleEnum.CADASTROS,
  },
  {
    text: RouteLabelsEnum.FICHA_MEDICA,
    icon: <LocalHospitalIcon fontSize="small" />,
    router: RoutesEnum.FICHA_MEDICA,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.PLANEJAMENTO_ANUAL_LISTA,
    icon: <AssignmentIcon fontSize="small" />,
    router: RoutesEnum.PLANEJAMENTO_ANUAL_LISTA,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
    moduleMenu: RoutesModuleEnum.CADASTROS,
  },
  {
    text: RouteLabelsEnum.PLANEJAMENTO_ANUAL,
    icon: <AssignmentIcon fontSize="small" />,
    router: RoutesEnum.PLANEJAMENTO_ANUAL,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  // ========== USO OPERACIONAL - ESTUDANTE ==========
  {
    text: RouteLabelsEnum.MINHAS_AULAS,
    icon: <MenuBookIcon fontSize="small" />,
    router: RoutesEnum.MINHAS_AULAS,
    isShowMenu: true,
    roles: [UserRoleEnum.ESTUDANTE],
  },
  {
    text: RouteLabelsEnum.CALENDARIO,
    icon: <CalendarIcon fontSize="small" />,
    router: RoutesEnum.CALENDARIO,
    isShowMenu: true,
    roles: [UserRoleEnum.ESTUDANTE],
  },
  {
    text: RouteLabelsEnum.BOLETIM,
    icon: <GradeIcon fontSize="small" />,
    router: RoutesEnum.BOLETIM,
    isShowMenu: true,
    roles: [UserRoleEnum.ESTUDANTE],
  },
  // ========== USO OPERACIONAL - PROFESSOR ==========
  {
    text: RouteLabelsEnum.MINHAS_AULAS,
    icon: <ClassIcon fontSize="small" />,
    router: RoutesEnum.MINHAS_AULAS,
    isShowMenu: true,
    roles: [UserRoleEnum.PROFESSOR],
  },
  {
    text: RouteLabelsEnum.CALENDARIO,
    icon: <CalendarIcon fontSize="small" />,
    router: RoutesEnum.CALENDARIO,
    isShowMenu: true,
    roles: [UserRoleEnum.PROFESSOR],
  },
  {
    text: RouteLabelsEnum.AVALIACOES,
    icon: <AssessmentIcon fontSize="small" />,
    router: RoutesEnum.AVALIACOES,
    isShowMenu: true,
    roles: [UserRoleEnum.PROFESSOR],
  },
  {
    text: RouteLabelsEnum.COMUNICADOS,
    icon: <AnnouncementIcon fontSize="small" />,
    router: RoutesEnum.COMUNICADOS,
    isShowMenu: true,
    roles: [UserRoleEnum.PROFESSOR],
  },
  // ========== GERENCIAMENTO - ADMIN ==========
  {
    text: RouteLabelsEnum.COMUNICADOS,
    icon: <AnnouncementIcon fontSize="small" />,
    router: RoutesEnum.COMUNICADOS,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.USUARIOS,
    icon: <GroupIcon fontSize="small" />,
    router: RoutesEnum.USUARIOS,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.RELATORIOS,
    icon: <AssessmentIcon fontSize="small" />,
    router: RoutesEnum.RELATORIOS,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.CONFIGURACOES,
    icon: <SettingsIcon fontSize="small" />,
    router: RoutesEnum.CONFIGURACOES,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.AULAS,
    icon: <ClassIcon fontSize="small" />,
    router: RoutesEnum.AULAS,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.UNIDADE,
    icon: <ClassIcon fontSize="small" />,
    router: RoutesEnum.UNIDADE,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
    moduleMenu: RoutesModuleEnum.CADASTROS,
  },
  {
    text: RouteLabelsEnum.UNIDADE_LISTA,
    icon: <ClassIcon fontSize="small" />,
    router: RoutesEnum.UNIDADE_LISTA,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
    moduleMenu: RoutesModuleEnum.CADASTROS,
  },

  {
    text: RouteLabelsEnum.PERFIL,
    icon: <PersonIcon fontSize="small" />,
    router: RoutesEnum.PERFIL,
    isShowMenu: false,
    roles: [UserRoleEnum.ESTUDANTE, UserRoleEnum.PROFESSOR, UserRoleEnum.ADMIN],
  },
];

export function getAllowedRoutes(role: UserRoleEnum): string[] {
  return ROUTES.filter((route) => route.roles.includes(role)).map((route) => route.router);
}

export function getMenuRoutes(role: UserRoleEnum): RouteConfig[] {
  return ROUTES.filter((route) => route.roles.includes(role) && route.isShowMenu);
}

/**
 * Gera dinamicamente os módulos baseados nas rotas disponíveis para o role
 */
export function getMenuModules(role: UserRoleEnum): MenuModule[] {
  // Obtém todos os módulos únicos das rotas visíveis para o role
  const modulesSet = new Set<RoutesModuleEnum>();

  ROUTES.forEach((route) => {
    if (
      route.roles.includes(role) &&
      route.isShowMenu &&
      route.moduleMenu !== null &&
      route.moduleMenu !== undefined
    ) {
      modulesSet.add(route.moduleMenu);
    }
  });

  // Mapeia os módulos para o formato MenuModule
  return Array.from(modulesSet).map((moduleId) => ({
    id: moduleId,
    text: MODULE_CONFIG[moduleId].text,
    icon: MODULE_CONFIG[moduleId].icon,
    roles: getUniqueRolesForModule(moduleId),
  }));
}

/**
 * Obtém os roles únicos que têm acesso a um módulo específico
 */
function getUniqueRolesForModule(moduleId: RoutesModuleEnum): UserRoleEnum[] {
  const rolesSet = new Set<UserRoleEnum>();

  ROUTES.forEach((route) => {
    if (route.moduleMenu === moduleId && route.isShowMenu) {
      route.roles.forEach((role) => rolesSet.add(role));
    }
  });

  return Array.from(rolesSet);
}

/**
 * Obtém as rotas de um módulo específico para um role
 */
export function getRoutesByModule(role: UserRoleEnum, moduleId: RoutesModuleEnum): RouteConfig[] {
  return ROUTES.filter(
    (route) => route.roles.includes(role) && route.isShowMenu && route.moduleMenu === moduleId,
  );
}

/**
 * Obtém as rotas que não pertencem a nenhum módulo
 */
export function getRoutesWithoutModule(role: UserRoleEnum): RouteConfig[] {
  return ROUTES.filter(
    (route) =>
      route.roles.includes(role) &&
      route.isShowMenu &&
      (route.moduleMenu === null || route.moduleMenu === undefined),
  );
}

/**
 * Encontra a RouteConfig mais adequada para um pathname.
 * Tenta match exato primeiro; depois testa prefixos progressivamente menores
 * para cobrir rotas dinâmicas (ex: /turma/123 → /turma).
 */
export function findRouteByPath(pathname: string): RouteConfig | undefined {
  const exact = ROUTES.find((r) => r.router === pathname);
  if (exact) return exact;

  const segments = pathname.split("/").filter(Boolean);
  for (let i = segments.length - 1; i > 0; i--) {
    const prefix = "/" + segments.slice(0, i).join("/");
    const match = ROUTES.find((r) => r.router === prefix);
    if (match) return match;
  }
  return undefined;
}

/**
 * Dada uma rota de detalhe (sem moduleMenu), tenta encontrar a rota-irmã
 * "lista" que compartilha o mesmo primeiro segmento e tem moduleMenu definido.
 */
export function findListSibling(pathname: string): RouteConfig | undefined {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  if (!firstSegment) return undefined;

  return ROUTES.find(
    (r) =>
      r.isShowMenu &&
      r.moduleMenu != null &&
      r.router.split("/").filter(Boolean)[0] === firstSegment,
  );
}
