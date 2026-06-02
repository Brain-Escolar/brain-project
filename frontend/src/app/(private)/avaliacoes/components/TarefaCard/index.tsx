"use client";

import { TarefaResponse } from "@/services/domains/tarefa/response";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import * as S from "./styles";

interface TarefaCardProps {
  tarefa: TarefaResponse;
}

function formatDate(prazo: string): string {
  if (!prazo) return "-";
  const [year, month, day] = prazo.split("-");
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

export default function TarefaCard({ tarefa }: TarefaCardProps) {
  const fileName = tarefa.documentoUrl
    ? tarefa.documentoUrl.split("/").pop() || tarefa.documentoUrl
    : null;

  return (
    <S.Card>
      <S.CardHeader>
        <S.CardTitle>{tarefa.conteudo}</S.CardTitle>
        {tarefa.professor && <S.DisciplinaChip>{tarefa.professor}</S.DisciplinaChip>}
      </S.CardHeader>

      {fileName && (
        <S.FileRow>
          <InsertDriveFileOutlinedIcon sx={{ fontSize: 20 }} />
          <S.FileName>{fileName}</S.FileName>
          <S.FileMeta>• Complete</S.FileMeta>
        </S.FileRow>
      )}

      <S.DateRow>
        <S.DateItem>
          <AccessTimeIcon sx={{ fontSize: 14 }} />
          <span>Prazo: {formatDate(tarefa.prazo)}</span>
        </S.DateItem>
      </S.DateRow>
    </S.Card>
  );
}
