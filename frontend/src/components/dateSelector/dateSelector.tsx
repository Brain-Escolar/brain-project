"use client";

import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as S from "./styles";

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const handlePreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(selectedDate.getDate() - 1);
    onDateChange(previousDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);
    onDateChange(nextDay);
  };

  // Nome do dia da semana ou "HOJE" se for o dia atual
  const nameOfDay = format(selectedDate, "EEEE", { locale: ptBR });
  // Formato: "1 de Agosto de 2025"
  const fullnameOfMonth = format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <S.Container>
      <IconButton onClick={handlePreviousDay} size="small">
        <ChevronLeft />
      </IconButton>
      {/* <S.DateText>{formatDate(selectedDate)}</S.DateText> */}
      <IconButton onClick={handleNextDay} size="small">
        <ChevronRight />
      </IconButton>
      <span>{fullnameOfMonth}</span> - <span>{nameOfDay}</span>
    </S.Container>
  );
}
