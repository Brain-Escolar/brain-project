import CampaignIcon from "@mui/icons-material/Campaign";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import ForumIcon from "@mui/icons-material/Forum";
import SchoolIcon from "@mui/icons-material/School";
import ClassIcon from "@mui/icons-material/Class";
import GroupsIcon from "@mui/icons-material/Groups";
import ScheduleIcon from "@mui/icons-material/Schedule";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import GradeIcon from "@mui/icons-material/Grade";
import CategoryIcon from "@mui/icons-material/Category";
import FolderIcon from "@mui/icons-material/Folder";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import HomeIcon from "@mui/icons-material/Home";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import BlockIcon from "@mui/icons-material/Block";
import * as React from "react";
import { UserRoleEnum, RoutesEnum, RouteLabelsEnum, RoutesModuleEnum } from "@/enums";
import type { TelaCodigo } from "@/constants/permissoes";

export interface RouteConfig {
  text: RouteLabelsEnum;
  icon: React.JSX.Element;
  router: RoutesEnum;
  isShowMenu: boolean;
  roles: UserRoleEnum[];
  moduleMenu?: RoutesModuleEnum | null;
  showBadge?: boolean;
  /**
   * Rota que não está no catálogo de permissões: vale para todo mundo que tem o
   * perfil (início, perfil próprio, tela de grupos, sem acesso e as entradas
   * ainda sem página, que o catálogo deixou de fora). As demais só
   * aparecem e abrem se a tela estiver liberada nos grupos da pessoa.
   */
  livre?: boolean;
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

const ROTAS: RouteConfig[] = [
  {
    text: RouteLabelsEnum.HOME_DASHBOARD,
    icon: <DashboardIcon fontSize="small" />,
    router: RoutesEnum.HOME,
    isShowMenu: true,
    roles: [UserRoleEnum.PROFESSOR],
    livre: true,
  },
  {
    text: RouteLabelsEnum.HOME_DASHBOARD,
    icon: <HomeIcon fontSize="small" />,
    router: RoutesEnum.HOME,
    isShowMenu: true,
    roles: [UserRoleEnum.ESTUDANTE],
    livre: true,
  },
  {
    text: RouteLabelsEnum.HOME_ESTUDANTE,
    icon: <DashboardIcon fontSize="small" />,
    router: RoutesEnum.HOME_ESTUDANTE_INICIO,
    isShowMenu: false,
    roles: [UserRoleEnum.ESTUDANTE],
    livre: true,
  },
  {
    text: RouteLabelsEnum.HOME_ADMIN,
    icon: <DashboardIcon fontSize="small" />,
    router: RoutesEnum.HOME_ADMIN,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
    livre: true,
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
    router: RoutesEnum.PROFESSOR_CADASTRO,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.ALUNOS,
    icon: <PersonIcon fontSize="small" />,
    router: RoutesEnum.ALUNO_LISTA,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
    moduleMenu: RoutesModuleEnum.CADASTROS,
  },
  {
    text: RouteLabelsEnum.ALUNO,
    icon: <PersonIcon fontSize="small" />,
    router: RoutesEnum.ALUNO_CADASTRO,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.SECRETARIO],
  },
  {
    text: RouteLabelsEnum.ALUNO,
    icon: <PersonIcon fontSize="small" />,
    router: RoutesEnum.ALUNO_DETALHE,
    isShowMenu: false,
    roles: [
      UserRoleEnum.ADMIN,
      UserRoleEnum.PROFESSOR,
      UserRoleEnum.SECRETARIO,
      UserRoleEnum.ORIENTADOR,
    ],
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
    router: RoutesEnum.TURMA_CADASTRO,
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
    router: RoutesEnum.GRADE_CURRICULAR_CADASTRO,
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
    router: RoutesEnum.GRUPO_DISCIPLINA_CADASTRO,
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
    router: RoutesEnum.DISCIPLINA_CADASTRO,
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
    router: RoutesEnum.SERIE_CADASTRO,
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
    roles: [UserRoleEnum.PROFESSOR, UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.AULA,
    icon: <ClassIcon fontSize="small" />,
    router: RoutesEnum.AULA_CADASTRO,
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
    router: RoutesEnum.HORARIO_CADASTRO,
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
    router: RoutesEnum.NOTA_CADASTRO,
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
    router: RoutesEnum.TAREFA_CADASTRO,
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
    router: RoutesEnum.ALERTA_CADASTRO,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.COMUNICADO_CADASTRO,
    icon: <CampaignIcon fontSize="small" />,
    router: RoutesEnum.COMUNICADOS_CADASTRO,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.SECRETARIO, UserRoleEnum.ORIENTADOR],
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
    router: RoutesEnum.FICHA_MEDICA_CADASTRO,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
    livre: true,
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
    router: RoutesEnum.PLANEJAMENTO_ANUAL_CADASTRO,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  // ========== COMUNICAÇÃO ==========
  {
    text: RouteLabelsEnum.COMUNICACAO,
    icon: <ForumIcon fontSize="small" />,
    router: RoutesEnum.COMUNICACAO,
    isShowMenu: true,
    roles: [UserRoleEnum.PROFESSOR, UserRoleEnum.ADMIN, UserRoleEnum.SECRETARIO],
    showBadge: true,
  },
  // ========== USO OPERACIONAL - ESTUDANTE ==========
  {
    text: RouteLabelsEnum.ALUNO_AULA,
    icon: <MenuBookOutlinedIcon fontSize="small" />,
    router: RoutesEnum.ALUNO_AULA,
    isShowMenu: false,
    roles: [UserRoleEnum.ESTUDANTE],
  },
  {
    text: RouteLabelsEnum.CALENDARIO,
    icon: <CalendarTodayOutlinedIcon fontSize="small" />,
    router: RoutesEnum.CALENDARIO,
    isShowMenu: true,
    roles: [UserRoleEnum.ESTUDANTE],
  },
  {
    text: RouteLabelsEnum.RELATORIOS,
    icon: <SummarizeOutlinedIcon fontSize="small" />,
    router: RoutesEnum.RELATORIOS,
    isShowMenu: true,
    roles: [UserRoleEnum.ESTUDANTE],
  },
  {
    text: RouteLabelsEnum.COMUNICADOS,
    icon: <CampaignOutlinedIcon fontSize="small" />,
    router: RoutesEnum.COMUNICADOS,
    isShowMenu: true,
    roles: [UserRoleEnum.ESTUDANTE],
  },
  {
    text: RouteLabelsEnum.COMUNICACAO,
    icon: <ChatBubbleOutlineOutlinedIcon fontSize="small" />,
    router: RoutesEnum.COMUNICACAO,
    isShowMenu: true,
    roles: [UserRoleEnum.ESTUDANTE],
    showBadge: true,
  },
  {
    text: RouteLabelsEnum.MATERIAIS_COMPLEMENTARES,
    icon: <FolderOpenOutlinedIcon fontSize="small" />,
    router: RoutesEnum.MATERIAIS_COMPLEMENTARES,
    isShowMenu: true,
    roles: [UserRoleEnum.ESTUDANTE],
  },
  // ========== PORTAL DO RESPONSÁVEL ==========
  // A maioria destas rotas JÁ EXISTE e é reusada: o responsável entra nas
  // telas do aluno, não em cópias. Só OCORRENCIAS e FINANCEIRO são novas.
  // Este é o padrão do arquivo — CALENDARIO, COMUNICADOS, COMUNICACAO e
  // MATERIAIS_COMPLEMENTARES já aparecem uma vez por perfil acima.
  {
    text: RouteLabelsEnum.HOME_DASHBOARD,
    icon: <HomeIcon fontSize="small" />,
    router: RoutesEnum.HOME,
    isShowMenu: true,
    roles: [UserRoleEnum.RESPONSAVEL],
    livre: true,
  },
  {
    text: RouteLabelsEnum.RELATORIOS,
    icon: <SummarizeOutlinedIcon fontSize="small" />,
    router: RoutesEnum.RELATORIOS,
    isShowMenu: true,
    roles: [UserRoleEnum.RESPONSAVEL],
  },
  {
    text: RouteLabelsEnum.OCORRENCIAS,
    icon: <FlagOutlinedIcon fontSize="small" />,
    router: RoutesEnum.OCORRENCIAS,
    isShowMenu: true,
    roles: [UserRoleEnum.RESPONSAVEL],
  },
  {
    text: RouteLabelsEnum.FICHA_MEDICA,
    icon: <HealthAndSafetyOutlinedIcon fontSize="small" />,
    router: RoutesEnum.FICHA_MEDICA_RESPONSAVEL,
    isShowMenu: true,
    roles: [UserRoleEnum.RESPONSAVEL],
  },
  {
    text: RouteLabelsEnum.DOCUMENTOS,
    icon: <DescriptionOutlinedIcon fontSize="small" />,
    router: RoutesEnum.DOCUMENTOS_RESPONSAVEL,
    isShowMenu: true,
    roles: [UserRoleEnum.RESPONSAVEL],
  },
  {
    text: RouteLabelsEnum.FINANCEIRO,
    icon: <RequestQuoteOutlinedIcon fontSize="small" />,
    router: RoutesEnum.FINANCEIRO,
    isShowMenu: true,
    roles: [UserRoleEnum.RESPONSAVEL],
  },
  {
    text: RouteLabelsEnum.CALENDARIO,
    icon: <CalendarTodayOutlinedIcon fontSize="small" />,
    router: RoutesEnum.CALENDARIO,
    isShowMenu: true,
    roles: [UserRoleEnum.RESPONSAVEL],
  },
  {
    text: RouteLabelsEnum.COMUNICADOS,
    icon: <CampaignOutlinedIcon fontSize="small" />,
    router: RoutesEnum.COMUNICADOS,
    isShowMenu: true,
    roles: [UserRoleEnum.RESPONSAVEL],
  },
  {
    text: RouteLabelsEnum.COMUNICACAO,
    icon: <ChatBubbleOutlineOutlinedIcon fontSize="small" />,
    router: RoutesEnum.COMUNICACAO,
    isShowMenu: true,
    roles: [UserRoleEnum.RESPONSAVEL],
    showBadge: true,
  },
  {
    text: RouteLabelsEnum.MATERIAIS_COMPLEMENTARES,
    icon: <FolderOpenOutlinedIcon fontSize="small" />,
    router: RoutesEnum.MATERIAIS_COMPLEMENTARES,
    isShowMenu: true,
    roles: [UserRoleEnum.RESPONSAVEL],
  },
  // ========== USO OPERACIONAL - PROFESSOR ==========
  {
    text: RouteLabelsEnum.MINHAS_TURMAS,
    icon: <GroupsIcon fontSize="small" />,
    router: RoutesEnum.MINHAS_TURMAS,
    isShowMenu: true,
    roles: [UserRoleEnum.PROFESSOR],
  },
  {
    text: RouteLabelsEnum.MINHAS_TURMAS,
    icon: <GroupsIcon fontSize="small" />,
    router: RoutesEnum.MINHAS_TURMAS_DETALHE,
    isShowMenu: false,
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
    roles: [UserRoleEnum.PROFESSOR, UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.DIARIO,
    icon: <AssignmentIcon fontSize="small" />,
    router: RoutesEnum.DIARIO,
    isShowMenu: true,
    roles: [UserRoleEnum.PROFESSOR, UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.AVALIACAO,
    icon: <AssessmentIcon fontSize="small" />,
    router: RoutesEnum.AVALIACAO_DETALHE,
    isShowMenu: false,
    roles: [UserRoleEnum.PROFESSOR, UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.AVALIACAO,
    icon: <AssessmentIcon fontSize="small" />,
    router: RoutesEnum.AVALIACAO_TURMA_NOTAS,
    isShowMenu: false,
    roles: [UserRoleEnum.PROFESSOR, UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.MATERIAIS_COMPLEMENTARES,
    icon: <FolderOpenOutlinedIcon fontSize="small" />,
    router: RoutesEnum.MATERIAIS_COMPLEMENTARES,
    isShowMenu: true,
    roles: [UserRoleEnum.PROFESSOR],
  },
  {
    text: RouteLabelsEnum.CONTRACHEQUE,
    icon: <RequestQuoteOutlinedIcon fontSize="small" />,
    router: RoutesEnum.CONTRACHEQUE,
    isShowMenu: true,
    roles: [UserRoleEnum.PROFESSOR],
  },
  {
    text: RouteLabelsEnum.COMUNICADOS,
    icon: <CampaignIcon fontSize="small" />,
    router: RoutesEnum.COMUNICADOS,
    isShowMenu: true,
    roles: [UserRoleEnum.PROFESSOR],
  },
  // ========== GERENCIAMENTO - ADMIN ==========
  {
    text: RouteLabelsEnum.COMUNICADOS,
    icon: <CampaignIcon fontSize="small" />,
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
    livre: true,
  },
  {
    // Fora do catálogo: o acesso é por perfil (ADMIN e, pela herança abaixo, DIRETOR).
    text: RouteLabelsEnum.GRUPOS_USUARIOS,
    icon: <ManageAccountsIcon fontSize="small" />,
    router: RoutesEnum.GRUPOS_USUARIOS,
    isShowMenu: true,
    roles: [UserRoleEnum.ADMIN],
    livre: true,
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
    livre: true,
  },
  {
    text: RouteLabelsEnum.AULAS,
    icon: <ClassIcon fontSize="small" />,
    router: RoutesEnum.AULA_CADASTRO,
    isShowMenu: false,
    roles: [UserRoleEnum.ADMIN],
  },
  {
    text: RouteLabelsEnum.UNIDADE,
    icon: <ClassIcon fontSize="small" />,
    router: RoutesEnum.UNIDADE_CADASTRO,
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
    roles: [
      UserRoleEnum.ESTUDANTE,
      UserRoleEnum.PROFESSOR,
      UserRoleEnum.ADMIN,
      UserRoleEnum.SECRETARIO,
      UserRoleEnum.ORIENTADOR,
    ],
    livre: true,
  },
  // ========== SECRETARIA ==========
  {
    text: RouteLabelsEnum.SECRETARIA_MATRICULAS,
    icon: <HowToRegIcon fontSize="small" />,
    router: RoutesEnum.SECRETARIA_MATRICULAS,
    isShowMenu: true,
    roles: [UserRoleEnum.SECRETARIO],
  },
  {
    text: RouteLabelsEnum.SECRETARIA_CRM,
    icon: <FilterAltIcon fontSize="small" />,
    router: RoutesEnum.SECRETARIA_CRM,
    isShowMenu: true,
    roles: [UserRoleEnum.SECRETARIO],
  },
  {
    text: RouteLabelsEnum.DOCUMENTOS,
    icon: <FactCheckOutlinedIcon fontSize="small" />,
    router: RoutesEnum.SECRETARIA_DOCUMENTOS,
    isShowMenu: true,
    roles: [UserRoleEnum.SECRETARIO],
  },
  {
    text: RouteLabelsEnum.SECRETARIA_ENTURMACAO,
    icon: <GroupAddIcon fontSize="small" />,
    router: RoutesEnum.SECRETARIA_ENTURMACAO,
    isShowMenu: true,
    roles: [UserRoleEnum.SECRETARIO],
  },
  {
    text: RouteLabelsEnum.SECRETARIA_TURMA_GERENCIAR,
    icon: <GroupAddIcon fontSize="small" />,
    router: RoutesEnum.SECRETARIA_TURMA_GERENCIAR,
    isShowMenu: false,
    roles: [UserRoleEnum.SECRETARIO],
  },
  {
    text: RouteLabelsEnum.CALENDARIO,
    icon: <CalendarTodayOutlinedIcon fontSize="small" />,
    router: RoutesEnum.CALENDARIO,
    isShowMenu: true,
    roles: [UserRoleEnum.SECRETARIO],
  },
  {
    text: RouteLabelsEnum.COMUNICADOS,
    icon: <CampaignOutlinedIcon fontSize="small" />,
    router: RoutesEnum.COMUNICADOS,
    isShowMenu: true,
    roles: [UserRoleEnum.SECRETARIO],
  },
  // ========== ORIENTACAO ==========
  {
    text: RouteLabelsEnum.HOME_DASHBOARD,
    icon: <HomeIcon fontSize="small" />,
    router: RoutesEnum.HOME,
    isShowMenu: true,
    roles: [UserRoleEnum.ORIENTADOR],
    livre: true,
  },
  {
    text: RouteLabelsEnum.ALUNOS,
    icon: <PersonSearchOutlinedIcon fontSize="small" />,
    router: RoutesEnum.ORIENTACAO_ALUNOS,
    isShowMenu: true,
    roles: [UserRoleEnum.ORIENTADOR],
  },
  {
    text: RouteLabelsEnum.COMUNICACAO,
    icon: <ChatBubbleOutlineOutlinedIcon fontSize="small" />,
    router: RoutesEnum.COMUNICACAO,
    isShowMenu: true,
    roles: [UserRoleEnum.ORIENTADOR],
    showBadge: true,
  },
  {
    text: RouteLabelsEnum.COMUNICADOS,
    icon: <CampaignOutlinedIcon fontSize="small" />,
    router: RoutesEnum.COMUNICADOS,
    isShowMenu: true,
    roles: [UserRoleEnum.ORIENTADOR],
  },
  {
    text: RouteLabelsEnum.CALENDARIO,
    icon: <CalendarTodayOutlinedIcon fontSize="small" />,
    router: RoutesEnum.CALENDARIO,
    isShowMenu: true,
    roles: [UserRoleEnum.ORIENTADOR],
  },
  {
    text: RouteLabelsEnum.SEM_ACESSO,
    icon: <BlockIcon fontSize="small" />,
    router: RoutesEnum.SEM_ACESSO,
    isShowMenu: false,
    roles: Object.values(UserRoleEnum),
    livre: true,
  },
];

/**
 * O DIRETOR usa as telas do ADMIN até ganhar área própria (docs/permissoes.md,
 * D8): toda entrada do ADMIN vale também para ele. A herança é só de rota; as
 * permissões do diretor vêm dos grupos, como as de qualquer perfil que não seja
 * o ADMIN.
 */
export const ROUTES: RouteConfig[] = ROTAS.map((rota) =>
  rota.roles.includes(UserRoleEnum.ADMIN) && !rota.roles.includes(UserRoleEnum.DIRETOR)
    ? { ...rota, roles: [...rota.roles, UserRoleEnum.DIRETOR] }
    : rota,
);

/** Filtro das funções de menu: hoje, rota livre ou tela liberada (usePermissoes.podeVerRota). */
export type FiltroDeRota = (rota: RouteConfig) => boolean;
const TODAS: FiltroDeRota = () => true;

/** Aceita um perfil ou a lista de perfis de quem acumula mais de um. */
type PerfilOuPerfis = UserRoleEnum | UserRoleEnum[];

function comoLista(role: PerfilOuPerfis): UserRoleEnum[] {
  return Array.isArray(role) ? role : [role];
}

/** A rota aparece se QUALQUER perfil da pessoa a autoriza. */
function autorizada(rotaRoles: UserRoleEnum[], role: PerfilOuPerfis): boolean {
  return comoLista(role).some((perfil) => rotaRoles.includes(perfil));
}

/**
 * Entrada que o perfil usa emprestada: a tela não é dele no routesConfig, mas
 * foi liberada no acesso individual (docs/permissoes.md, D22). Vale a entrada
 * que a rota tem no menu de outro perfil (a primeira com isShowMenu), com o
 * ícone e o módulo de lá. Rota livre não se empresta: ela é guardada só pelo
 * perfil.
 */
function emprestada(route: RouteConfig, role: PerfilOuPerfis): boolean {
  if (route.livre) return false;
  const daRota = ROUTES.filter((r) => r.router === route.router);
  if (daRota.some((r) => autorizada(r.roles, role))) return false;
  return (daRota.find((r) => r.isShowMenu) ?? daRota[0]) === route;
}

/**
 * A entrada vale para o perfil: é dele, ou é emprestada e o filtro a libera.
 * Sem filtro (TODAS) nada é emprestado: sem as permissões, não há como saber
 * o que foi liberado fora do perfil.
 */
function daVez(route: RouteConfig, role: PerfilOuPerfis, pode: FiltroDeRota): boolean {
  if (autorizada(route.roles, role)) return pode(route);
  return pode !== TODAS && emprestada(route, role) && pode(route);
}

const CODIGO_POR_ROTA = new Map<string, TelaCodigo>(
  Object.entries(RoutesEnum).map(([codigo, rota]) => [rota, codigo as TelaCodigo]),
);

/** O código da tela no catálogo de permissões: a chave da rota no RoutesEnum. */
export function codigoDaTela(rota: RouteConfig): TelaCodigo | undefined {
  return CODIGO_POR_ROTA.get(rota.router);
}

/** Para onde cada perfil vai ao entrar (o middleware usa o mesmo). */
export function rotaInicialDoPerfil(perfil: UserRoleEnum): RoutesEnum {
  switch (perfil) {
    case UserRoleEnum.ADMIN:
    case UserRoleEnum.DIRETOR:
      return RoutesEnum.HOME_ADMIN;
    case UserRoleEnum.SECRETARIO:
      return RoutesEnum.SECRETARIA_MATRICULAS;
    default:
      return RoutesEnum.HOME;
  }
}

/**
 * Para onde mandar quem abriu uma tela que não tem liberada: a rota inicial do
 * perfil, se ele puder vê-la; senão a primeira do menu que puder; senão a
 * página de sem acesso. Nunca devolve uma rota bloqueada, então não há loop.
 */
export function rotaPermitidaDoPerfil(perfil: UserRoleEnum, pode: FiltroDeRota): string {
  const inicial = ROUTES.find(
    (rota) => rota.router === rotaInicialDoPerfil(perfil) && rota.roles.includes(perfil),
  );
  if (inicial && pode(inicial)) return inicial.router;
  const primeira = ROUTES.find((rota) => rota.isShowMenu && daVez(rota, perfil, pode));
  return primeira?.router ?? RoutesEnum.SEM_ACESSO;
}

export function getAllowedRoutes(role: UserRoleEnum): string[] {
  return ROUTES.filter((route) => route.roles.includes(role)).map((route) => route.router);
}

export function getMenuRoutes(role: UserRoleEnum, pode: FiltroDeRota = TODAS): RouteConfig[] {
  return ROUTES.filter((route) => route.isShowMenu && daVez(route, role, pode));
}

/**
 * Gera dinamicamente os módulos baseados nas rotas disponíveis para o role
 */
export function getMenuModules(role: PerfilOuPerfis, pode: FiltroDeRota = TODAS): MenuModule[] {
  // Obtém todos os módulos únicos das rotas visíveis para o role
  const modulesSet = new Set<RoutesModuleEnum>();

  ROUTES.forEach((route) => {
    if (
      route.isShowMenu &&
      route.moduleMenu !== null &&
      route.moduleMenu !== undefined &&
      daVez(route, role, pode)
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
export function getRoutesByModule(
  role: PerfilOuPerfis,
  moduleId: RoutesModuleEnum,
  pode: FiltroDeRota = TODAS,
): RouteConfig[] {
  return ROUTES.filter(
    (route) => route.isShowMenu && route.moduleMenu === moduleId && daVez(route, role, pode),
  );
}

/**
 * Obtém as rotas que não pertencem a nenhum módulo
 */
export function getRoutesWithoutModule(
  role: PerfilOuPerfis,
  pode: FiltroDeRota = TODAS,
): RouteConfig[] {
  const visiveis = ROUTES.filter(
    (route) =>
      route.isShowMenu &&
      (route.moduleMenu === null || route.moduleMenu === undefined) &&
      daVez(route, role, pode),
  );

  // A mesma rota e registrada uma vez por perfil (padrao do arquivo). Quem
  // acumula perfis veria o item repetido no menu — deduplica por destino.
  const vistos = new Set<string>();
  return visiveis.filter((route) => {
    if (vistos.has(route.router)) return false;
    vistos.add(route.router);
    return true;
  });
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
 * Só considera rotas que o perfil pode acessar — senão o breadcrumb ofereceria
 * um link que o middleware rejeita (ex.: `/aluno/lista`, que é só do ADMIN,
 * aparecendo para quem abre `/aluno/detalhe/:id`).
 */
export function findListSibling(pathname: string, role?: UserRoleEnum): RouteConfig | undefined {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  if (!firstSegment) return undefined;

  return ROUTES.find(
    (r) =>
      r.isShowMenu &&
      r.moduleMenu != null &&
      r.router.split("/").filter(Boolean)[0] === firstSegment &&
      (role == null || r.roles.includes(role)),
  );
}
