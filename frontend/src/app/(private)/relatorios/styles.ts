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

  @media (prefers-reduced-motion: no-preference) {
    animation: relatorioFade 240ms ease-out both;
  }

  @keyframes relatorioFade {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

/* ---------- Seletor de relatório (chips) ---------- */

export const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Chip = styled.button<{ $selected?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: ${cssVarRadius("pill")};
  font-family: var(--fonts-body);
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${(p) => (p.$selected ? cssVarFontWeight("semibold") : cssVarFontWeight("medium"))};
  cursor: pointer;
  border: 1px solid
    ${(p) => (p.$selected ? cssVarColor("primary") : cssVarColor("border"))};
  background: ${(p) => (p.$selected ? cssVarColor("primary") : cssVarColor("backgroundSection"))};
  color: ${(p) => (p.$selected ? "#fff" : cssVarColor("textSecondary"))};
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;

  &:hover:not(:disabled):not([aria-selected="true"]) {
    background: ${cssVarColor("backgroundHover")};
  }

  &:disabled {
    border-style: dashed;
    border-color: ${cssVarColor("border")};
    background: transparent;
    color: ${cssVarColor("textTertiary")};
    cursor: default;
  }

  svg {
    font-size: 18px;
  }
`;

export const ChipSoon = styled.span`
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("semibold")};
  padding: 2px 7px;
  border-radius: ${cssVarRadius("pill")};
  background: ${cssVarColor("surfaceSunken")};
  color: ${cssVarColor("textTertiary")};
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
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${cssVarColor("textSecondary")};
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
    font-size: 19px;
  }
`;

export const KpiValue = styled.span`
  display: block;
  font-family: var(--fonts-body);
  font-variant-numeric: tabular-nums;
  font-size: ${cssVarFontSize("h2")};
  font-weight: ${cssVarFontWeight("semibold")};
  line-height: 1.1;
  letter-spacing: -0.01em;
  color: ${cssVarColor("text")};
`;

/* ---------- Tabela ---------- */

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
  min-width: 860px;
  white-space: nowrap;

  th {
    padding: 11px 10px;
    text-align: center;
    font-size: ${cssVarFontSize("small")};
    font-weight: ${cssVarFontWeight("semibold")};
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: ${cssVarColor("textSecondary")};
    background: ${cssVarColor("surfaceSunken")};
    border-bottom: 1px solid ${cssVarColor("border")};
  }

  td {
    padding: 12px 10px;
    text-align: center;
    font-family: var(--fonts-body);
    font-variant-numeric: tabular-nums;
    font-size: 13.5px;
    font-weight: ${cssVarFontWeight("semibold")};
    border-bottom: 1px solid ${cssVarColor("borderSubtle")};
  }

  th.left,
  td.disc {
    text-align: left;
    padding-left: 16px;
    padding-right: 16px;
  }

  /* separadores verticais entre grupos de colunas */
  th.sep,
  td.sep {
    border-left: 1px solid ${cssVarColor("border")};
  }
  td.sep {
    border-left-color: ${cssVarColor("borderSubtle")};
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover td {
    background: ${cssVarColor("backgroundHover")};
  }

  /* coluna/cabeçalho do período atual */
  th.cur {
    background: ${cssVarColor("primarySubtle")};
    color: ${cssVarColor("primary")};
  }
  td.cur {
    background: ${cssVarColor("primarySubtle")};
  }
`;

export const DisciplinaCell = styled.td`
  font-family: var(--fonts-body) !important;
  font-size: ${cssVarFontSize("body1")} !important;
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const Nota = styled.span<{ $bad?: boolean }>`
  color: ${(p) => (p.$bad ? cssVarColor("errorText") : cssVarColor("text"))};
`;

export const Faltas = styled.span<{ $alert?: boolean }>`
  font-weight: ${cssVarFontWeight("medium")};
  color: ${(p) => (p.$alert ? cssVarColor("warningText") : cssVarColor("textSecondary"))};
`;

export const Rec = styled.span`
  font-weight: ${cssVarFontWeight("regular")};
  color: ${cssVarColor("textTertiary")};
`;

/* Pílula da nota final */
export const GradePill = styled.span<{ $bad?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 46px;
  padding: 5px 10px;
  border-radius: ${cssVarRadius("pill")};
  font-family: var(--fonts-body);
  font-variant-numeric: tabular-nums;
  font-weight: ${cssVarFontWeight("semibold")};
  background: ${(p) => (p.$bad ? cssVarColor("errorSubtle") : cssVarColor("successSubtle"))};
  color: ${(p) => (p.$bad ? cssVarColor("errorText") : cssVarColor("successText"))};
`;

/* ---------- Barra de frequência ---------- */

export const Bar = styled.div`
  height: 6px;
  min-width: 130px;
  border-radius: ${cssVarRadius("pill")};
  background: ${cssVarColor("surfaceSunken")};
  overflow: hidden;
`;

export const BarFill = styled.i<{ $pct: number; $alert?: boolean }>`
  display: block;
  height: 100%;
  border-radius: ${cssVarRadius("pill")};
  width: ${(p) => Math.max(0, Math.min(100, p.$pct))}%;
  background: ${(p) => (p.$alert ? cssVarColor("warning") : cssVarColor("primary"))};
`;

/* ---------- Legenda ---------- */

export const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px;
  padding: 0 4px;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textTertiary")};

  span {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }
`;

export const LegendDot = styled.i<{ $variant: "bad" | "current" }>`
  width: 10px;
  height: 10px;
  border-radius: ${cssVarRadius("pill")};
  ${(p) =>
    p.$variant === "bad"
      ? `background: ${cssVarColor("error")};`
      : `background: ${cssVarColor("primarySubtle")}; border: 1.5px solid ${cssVarColor("primary")};`}
`;
