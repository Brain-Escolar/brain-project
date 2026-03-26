import type { AlertaResponse } from "@/services/domains/alerta";

export type DateGroupKey = "hoje" | "ontem" | "antes";

export function groupAlertasByDate(
  alertas: AlertaResponse[],
): Record<DateGroupKey, AlertaResponse[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: Record<DateGroupKey, AlertaResponse[]> = {
    hoje: [],
    ontem: [],
    antes: [],
  };

  alertas.forEach((alerta) => {
    const [year, month, day] = alerta.data;
    const alertaDate = new Date(year, month - 1, day);
    alertaDate.setHours(0, 0, 0, 0);

    if (alertaDate.getTime() === today.getTime()) {
      groups.hoje.push(alerta);
    } else if (alertaDate.getTime() === yesterday.getTime()) {
      groups.ontem.push(alerta);
    } else {
      groups.antes.push(alerta);
    }
  });

  return groups;
}

export function formatGroupTimeLabel(alerta: AlertaResponse): string {
  const [year, month, day] = alerta.data;
  const alertaDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  alertaDate.setHours(0, 0, 0, 0);

  if (alertaDate.getTime() === today.getTime()) return "Hoje";
  if (alertaDate.getTime() === yesterday.getTime()) return "Ontem";
  const d = String(alertaDate.getDate()).padStart(2, "0");
  const m = String(alertaDate.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}`;
}

export const GROUP_LABELS: Record<DateGroupKey, string> = {
  hoje: "Hoje",
  ontem: "Ontem",
  antes: "Anterior",
};
