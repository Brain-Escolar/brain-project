"use client";

import Badge from "@/components/badge";
import { TarefaResponse } from "@/services/domains/tarefa/response";
import { getDisciplinaIcon } from "@/utils/disciplinaUtils";
import AttachFileRounded from "@mui/icons-material/AttachFileRounded";
import EventRounded from "@mui/icons-material/EventRounded";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import MenuBookRounded from "@mui/icons-material/MenuBookRounded";
import * as S from "./styles";

interface TarefaCardProps {
  tarefa: TarefaResponse;
}

function formatDate(prazo: string): string {
  if (!prazo) return "-";
  const [year, month, day] = prazo.split("-");
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

function isVencida(prazo: string): boolean {
  if (!prazo) return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return new Date(`${prazo}T00:00:00`) < hoje;
}

export default function TarefaCard({ tarefa }: TarefaCardProps) {
  const DisciplinaIcon = getDisciplinaIcon(tarefa.disciplina);
  const fileName = tarefa.documentoUrl
    ? tarefa.documentoUrl.split("/").pop()?.split("?")[0]
    : null;
  const vencida = isVencida(tarefa.prazo);

  return (
    <S.Row>
      <S.RowIcon>
        <DisciplinaIcon sx={{ fontSize: 24 }} />
      </S.RowIcon>
      <S.RowInfo>
        <S.RowTitle>{tarefa.conteudo}</S.RowTitle>
        <S.RowMeta>
          <span>
            <MenuBookRounded />
            {tarefa.disciplina}
          </span>
          <span>
            <GroupsRounded />
            {tarefa.turma}
          </span>
          <span>
            <EventRounded />
            Prazo: {formatDate(tarefa.prazo)}
          </span>
          {fileName && (
            <span>
              <AttachFileRounded />
              {fileName}
            </span>
          )}
        </S.RowMeta>
      </S.RowInfo>
      <S.RowRight>
        <Badge $tone={vencida ? "error" : "success"}>{vencida ? "Vencida" : "Em aberto"}</Badge>
      </S.RowRight>
    </S.Row>
  );
}
