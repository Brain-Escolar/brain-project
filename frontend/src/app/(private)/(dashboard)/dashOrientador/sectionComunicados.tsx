"use client";

import { useRouter } from "next/navigation";
import { differenceInCalendarDays, format } from "date-fns";
import { Skeleton } from "@mui/material";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import { RoutesEnum } from "@/enums";
import {
  ComunicadoCategoria,
  ComunicadoListResponse,
} from "@/services/domains/comunicado/response";
import * as S from "./styles";

interface SectionComunicadosProps {
  comunicados: ComunicadoListResponse[];
  loading: boolean;
}

const CATEGORIA_LABEL: Record<ComunicadoCategoria, string> = {
  EVENTO: "Evento",
  ADMINISTRATIVO: "Administrativo",
  CALENDARIO: "Calendário",
  ATUALIZACAO_RH: "RH",
};

function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatarQuando(dataIso: string): string {
  if (!dataIso) return "";
  const data = parseLocalDate(dataIso);
  const dias = differenceInCalendarDays(new Date(), data);
  if (dias === 0) return "Hoje";
  if (dias === 1) return "Ontem";
  if (dias > 1 && dias <= 7) return `Há ${dias} dias`;
  return format(data, "dd/MM/yyyy");
}

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

export default function SectionComunicados({ comunicados, loading }: SectionComunicadosProps) {
  const router = useRouter();

  return (
    <S.PanelCard>
      <S.PanelHeader>
        <S.PanelTitleGroup>
          <S.PanelTitle>Comunicados recentes</S.PanelTitle>
        </S.PanelTitleGroup>
        <S.LinkButton type="button" onClick={() => router.push(RoutesEnum.COMUNICADOS)}>
          Ver mural
        </S.LinkButton>
      </S.PanelHeader>

      {loading ? (
        <Skeleton variant="rounded" height={150} />
      ) : comunicados.length === 0 ? (
        <S.EmptyHint>Nenhum comunicado publicado.</S.EmptyHint>
      ) : (
        <S.RowList>
          {comunicados.map((comunicado) => (
            <S.Row
              key={comunicado.id}
              type="button"
              onClick={() => router.push(RoutesEnum.COMUNICADOS)}
            >
              <S.RowIcon>
                <CategoriaIcon categoria={comunicado.categoria} />
              </S.RowIcon>
              <S.RowBody>
                <S.RowTitle>{comunicado.titulo}</S.RowTitle>
                <S.RowMeta>
                  {[
                    comunicado.categoria ? CATEGORIA_LABEL[comunicado.categoria] : null,
                    formatarQuando(comunicado.data),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </S.RowMeta>
              </S.RowBody>
            </S.Row>
          ))}
        </S.RowList>
      )}
    </S.PanelCard>
  );
}
