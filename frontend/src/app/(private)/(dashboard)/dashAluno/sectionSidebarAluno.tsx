"use client";

import { useRouter } from "next/navigation";
import { format, differenceInCalendarDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import { useTarefasAluno } from "@/hooks/useTarefasAluno";
import { useComunicados } from "@/hooks/useComunicados";
import { getDisciplinaTagTone } from "@/utils/disciplinaUtils";
import { ComunicadoCategoria } from "@/services/domains/comunicado/response";
import { RoutesEnum } from "@/enums";
import * as S from "./styles";

const COMUNICADOS_VISIVEIS = 3;

function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatPrazoRelativo(prazoIso: string): string {
  const prazo = parseLocalDate(prazoIso);
  const dias = differenceInCalendarDays(prazo, new Date());
  if (dias === 0) return "Hoje";
  if (dias === 1) return "Amanhã";
  const weekday = format(prazo, "EEEEEE", { locale: ptBR });
  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalized} · ${format(prazo, "dd/MM")}`;
}

function formatTempoRelativo(dataIso: string): string {
  const dias = differenceInCalendarDays(new Date(), parseLocalDate(dataIso));
  if (dias <= 0) return "hoje";
  if (dias === 1) return "há 1 dia";
  return `há ${dias} dias`;
}

const CATEGORIA_LABEL: Record<ComunicadoCategoria, string> = {
  EVENTO: "Evento",
  ADMINISTRATIVO: "Administrativo",
  CALENDARIO: "Calendário",
  ATUALIZACAO_RH: "RH",
};

function CategoriaIcon({ categoria }: { categoria?: ComunicadoCategoria }) {
  switch (categoria) {
    case "EVENTO":
      return <EventOutlinedIcon />;
    case "CALENDARIO":
      return <CalendarMonthOutlinedIcon />;
    case "ATUALIZACAO_RH":
      return <WorkOutlineOutlinedIcon />;
    default:
      return <CampaignOutlinedIcon />;
  }
}

function SectionProximasTarefas() {
  const router = useRouter();
  const { tarefas, loading } = useTarefasAluno();

  return (
    <S.PanelCard>
      <S.PanelHeader>
        <S.PanelTitle>Próximas tarefas</S.PanelTitle>
        <S.CountBadge>{tarefas.length}</S.CountBadge>
      </S.PanelHeader>

      {loading ? (
        <S.EmptyHint>Carregando...</S.EmptyHint>
      ) : tarefas.length === 0 ? (
        <S.EmptyHint>Nenhuma tarefa pendente</S.EmptyHint>
      ) : (
        <S.CardList>
          {tarefas.map((tarefa) => (
            <S.TarefaCard
              key={tarefa.id}
              onClick={() => router.push(`${RoutesEnum.ALUNO_AULA}/${tarefa.aulaId}`)}
            >
              <S.CardTopRow>
                <S.SubjectTag $tone={getDisciplinaTagTone(tarefa.disciplina)}>
                  {tarefa.disciplina}
                </S.SubjectTag>
                <S.CardDeadline>
                  <CalendarTodayOutlinedIcon />
                  {formatPrazoRelativo(tarefa.prazo)}
                </S.CardDeadline>
              </S.CardTopRow>
              <S.CardTitle>{tarefa.conteudo}</S.CardTitle>
            </S.TarefaCard>
          ))}
        </S.CardList>
      )}
    </S.PanelCard>
  );
}

function SectionComunicados() {
  const { comunicados, loading } = useComunicados(0, COMUNICADOS_VISIVEIS);

  return (
    <S.PanelCard>
      <S.PanelHeader>
        <S.PanelTitle>Comunicados</S.PanelTitle>
      </S.PanelHeader>

      {loading ? (
        <S.EmptyHint>Carregando...</S.EmptyHint>
      ) : comunicados.length === 0 ? (
        <S.EmptyHint>Nenhum comunicado recente</S.EmptyHint>
      ) : (
        <S.ComunicadoList>
          {comunicados.map((comunicado) => (
            <S.ComunicadoRow key={comunicado.id}>
              <S.ComunicadoIcon>
                <CategoriaIcon categoria={comunicado.categoria} />
              </S.ComunicadoIcon>
              <S.ComunicadoBody>
                <S.ComunicadoTitle>{comunicado.titulo}</S.ComunicadoTitle>
                <S.ComunicadoMeta>
                  {[
                    comunicado.categoria ? CATEGORIA_LABEL[comunicado.categoria] : null,
                    formatTempoRelativo(comunicado.data),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </S.ComunicadoMeta>
              </S.ComunicadoBody>
            </S.ComunicadoRow>
          ))}
        </S.ComunicadoList>
      )}
    </S.PanelCard>
  );
}

export default function SectionSidebarAluno() {
  return (
    <S.SidebarStack>
      <SectionProximasTarefas />
      <SectionComunicados />
    </S.SidebarStack>
  );
}
