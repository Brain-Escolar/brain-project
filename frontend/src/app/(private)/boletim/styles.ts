"use client";
import {
  cssVarColor,
  cssVarFontSize,
  cssVarFontWeight,
  cssVarRadius,
  cssVarShadow,
} from "@/styles";
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: ${cssVarColor("background")};
`;

/* ---------- KPI cards ---------- */

export const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export type KpiTone = "primary" | "success" | "warning" | "error";

const kpiToneMap: Record<KpiTone, { bg: string; color: string }> = {
  primary: { bg: cssVarColor("primarySubtle"), color: cssVarColor("primary") },
  success: { bg: cssVarColor("successSubtle"), color: cssVarColor("successText") },
  warning: { bg: cssVarColor("warningSubtle"), color: cssVarColor("warningText") },
  error: { bg: cssVarColor("errorSubtle"), color: cssVarColor("errorText") },
};

export const KpiCard = styled.div`
  background: ${cssVarColor("backgroundSection")};
  border: 1px solid ${cssVarColor("border")};
  border-radius: ${cssVarRadius("lg")};
  padding: 20px;
  box-shadow: ${cssVarShadow("level1")};
`;

export const KpiHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`;

export const KpiLabel = styled.span`
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("semibold")};
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${cssVarColor("textTertiary")};
`;

export const KpiIcon = styled.span<{ $tone: KpiTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: ${cssVarRadius("sm")};
  background: ${(p) => kpiToneMap[p.$tone].bg};
  color: ${(p) => kpiToneMap[p.$tone].color};

  svg {
    font-size: 20px;
  }
`;

export const KpiValue = styled.span`
  display: block;
  font-family: var(--fonts-heading);
  font-variant-numeric: tabular-nums;
  font-size: ${cssVarFontSize("h1")};
  font-weight: ${cssVarFontWeight("bold")};
  line-height: 1.1;
  letter-spacing: -0.01em;
  color: ${cssVarColor("text")};
`;

/* ---------- Tabela do boletim ---------- */

export const TableWrap = styled.div`
  background: ${cssVarColor("backgroundSection")};
  border: 1px solid ${cssVarColor("border")};
  border-radius: ${cssVarRadius("lg")};
  box-shadow: ${cssVarShadow("level1")};
  overflow: hidden;
`;

export const TableScroll = styled.div`
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;

  th,
  td {
    padding: 12px 14px;
    text-align: center;
    border-bottom: 1px solid ${cssVarColor("borderSubtle")};
  }

  thead th {
    background: ${cssVarColor("surfaceSunken")};
    font-size: ${cssVarFontSize("small")};
    font-weight: ${cssVarFontWeight("semibold")};
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: ${cssVarColor("textSecondary")};
  }

  /* separadores verticais entre grupos de bimestre/seções */
  th.group,
  td.group {
    border-left: 1px solid ${cssVarColor("borderSubtle")};
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:nth-child(even) td {
    background: ${cssVarColor("background")};
  }

  /* coluna e cabeçalho do bimestre atual */
  th.current,
  td.current {
    background: ${cssVarColor("primarySubtle")} !important;
    color: ${cssVarColor("primary")};
  }
`;

export const DisciplinaCell = styled.td`
  text-align: right !important;
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const Nota = styled.span<{ $bad?: boolean }>`
  font-family: var(--fonts-body);
  font-variant-numeric: tabular-nums;
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${(p) => (p.$bad ? cssVarColor("error") : cssVarColor("text"))};
`;

export const Faltas = styled.span`
  font-family: var(--fonts-body);
  font-variant-numeric: tabular-nums;
  color: ${cssVarColor("textSecondary")};
`;

export const Rec = styled.span`
  font-family: var(--fonts-body);
  font-variant-numeric: tabular-nums;
  color: ${cssVarColor("textTertiary")};
`;

/* Pílula da nota final */
export const GradePill = styled.span<{ $bad?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 46px;
  padding: 4px 12px;
  border-radius: ${cssVarRadius("pill")};
  font-family: var(--fonts-body);
  font-variant-numeric: tabular-nums;
  font-weight: ${cssVarFontWeight("bold")};
  border: 1px solid ${(p) => (p.$bad ? cssVarColor("error") : cssVarColor("success"))};
  background: ${(p) => (p.$bad ? cssVarColor("errorSubtle") : cssVarColor("successSubtle"))};
  color: ${(p) => (p.$bad ? cssVarColor("errorText") : cssVarColor("successText"))};
`;

/* ---------- Legenda ---------- */

export const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  padding: 0 4px;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};

  span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: ${cssVarColor("textSecondary")};
  }
`;

export const LegendDot = styled.i<{ $variant: "bad" | "current" }>`
  width: 10px;
  height: 10px;
  border-radius: ${cssVarRadius("pill")};
  ${(p) =>
    p.$variant === "bad"
      ? `background: ${cssVarColor("error")};`
      : `border: 2px solid ${cssVarColor("primary")};`}
`;
