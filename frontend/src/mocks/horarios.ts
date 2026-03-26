import { HorarioListaResponse } from "@/services/domains/horario/response";

export const mockHorarios: HorarioListaResponse[] = [
  { id: 1, nome: "1º Horário", horarioInicio: "07:30", horarioFim: "08:20" },
  { id: 2, nome: "2º Horário", horarioInicio: "08:20", horarioFim: "09:10" },
  { id: 3, nome: "Intervalo Manhã", horarioInicio: "09:10", horarioFim: "09:30" },
  { id: 4, nome: "3º Horário", horarioInicio: "09:30", horarioFim: "10:20" },
  { id: 5, nome: "4º Horário", horarioInicio: "10:20", horarioFim: "11:10" },
  { id: 6, nome: "5º Horário", horarioInicio: "11:10", horarioFim: "12:00" },
  { id: 7, nome: "6º Horário", horarioInicio: "13:00", horarioFim: "13:50" },
  { id: 8, nome: "7º Horário", horarioInicio: "13:50", horarioFim: "14:40" },
  { id: 9, nome: "Intervalo Tarde", horarioInicio: "14:40", horarioFim: "15:00" },
  { id: 10, nome: "8º Horário", horarioInicio: "15:00", horarioFim: "15:50" },
  { id: 11, nome: "9º Horário", horarioInicio: "15:50", horarioFim: "16:40" },
  { id: 12, nome: "10º Horário", horarioInicio: "16:40", horarioFim: "17:30" },
];
