"use client";
import { useMutation } from "@tanstack/react-query";
import { calendarGoogleApi } from "@/services/api";
import { GoogleEventoRequest } from "@/services/domains/calendar-google";
import { toast } from "react-toastify";

export function useGoogleCalendar() {
  const adicionarEventos = useMutation({
    mutationFn: (eventos: GoogleEventoRequest[]) => calendarGoogleApi.criarEventos(eventos),
    onSuccess: () => {
      toast.success("Evento adicionado ao Google Agenda!");
    },
    onError: (error) => {
      console.error("Erro ao adicionar evento ao Google Agenda:", error);
      toast.error("Erro ao sincronizar com o Google Agenda. Verifique sua conta Google.");
    },
  });

  const criarCalendario = useMutation({
    mutationFn: (nomeCalendario: string) => calendarGoogleApi.criarCalendario(nomeCalendario),
    onSuccess: () => {
      toast.success("Calendário criado no Google Agenda!");
    },
    onError: (error) => {
      console.error("Erro ao criar calendário no Google Agenda:", error);
      toast.error("Erro ao criar calendário no Google Agenda.");
    },
  });

  return {
    adicionarEventos,
    criarCalendario,
  };
}
