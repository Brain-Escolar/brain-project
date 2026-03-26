"use client";

import * as S from "./styles";

interface EvaluationCardProps {
  title: string;
  subject: string;
  maxScore: number;
  status: "pending" | "review" | "completed";
  progress: number;
  total: number;
  openDate: string;
  dueDate: string;
}

const statusLabels = {
  pending: "Pendente",
  review: "Em revisão",
  completed: "Concluído",
};

export default function EvaluationCard({
  title,
  subject,
  maxScore,
  status,
  progress,
  total,
  openDate,
  dueDate,
}: EvaluationCardProps) {
  return (
    <S.Card>
      <S.CardHeader>
        <S.CardTitle>{title}</S.CardTitle>
        <S.StatusBadge status={status}>{statusLabels[status]}</S.StatusBadge>
      </S.CardHeader>

      <S.CardSubject>{subject}</S.CardSubject>
      <S.CardMeta>Nota máxima: {maxScore} pontos</S.CardMeta>

      <S.ProgressContainer>
        <S.ProgressLabel>
          <span>
            {progress}/{total}
          </span>
        </S.ProgressLabel>
        <S.ProgressBar>
          <S.ProgressFill progress={(progress / total) * 100} />
        </S.ProgressBar>
      </S.ProgressContainer>

      <S.CardDates>
        <S.DateItem>
          <S.DateIcon>📅</S.DateIcon>
          <span>Abertura: {openDate}</span>
        </S.DateItem>
        <S.DateItem>
          <S.DateIcon>📅</S.DateIcon>
          <span>Prazo: {dueDate}</span>
        </S.DateItem>
      </S.CardDates>
    </S.Card>
  );
}
