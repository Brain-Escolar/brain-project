import { TipoEvento } from "@/services/domains/evento";

export const TIPO_CONFIG: Record<
  TipoEvento,
  { label: string; labelSingular: string; color: string }
> = {
  PROVA: { label: "Provas", labelSingular: "Prova", color: "#f44336" },
  ENTREGA_PROVA: { label: "Entregas de Prova", labelSingular: "Entrega de Prova", color: "#ff9800" },
  ENTREGA_NOTAS: { label: "Entrega de Notas", labelSingular: "Entrega de Notas", color: "#9c27b0" },
  REUNIAO: { label: "Reuniões", labelSingular: "Reunião", color: "#2196f3" },
  FERIADO: { label: "Feriados", labelSingular: "Feriado", color: "#4caf50" },
  OUTRO: { label: "Outros", labelSingular: "Outro", color: "#757575" },
};

export const TIPO_OPTIONS: { value: TipoEvento; label: string }[] = (
  Object.keys(TIPO_CONFIG) as TipoEvento[]
).map((value) => ({ value, label: TIPO_CONFIG[value].labelSingular }));

/** Formata "yyyy-MM-dd" → "dd/mm/yyyy" sem passar por Date (evita deslocamento de fuso). */
export function formatarDataBr(data: string): string {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}
