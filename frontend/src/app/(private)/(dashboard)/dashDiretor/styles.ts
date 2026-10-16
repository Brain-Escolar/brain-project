"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled from "styled-components";

export type Tendencia = "alta" | "baixa" | "neutra";

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  min-width: 0;
`;

/** Duas colunas 7:3 como no painel do professor; empilha abaixo de 1100px. */
export const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 3fr);
  gap: 20px;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Card = styled.section`
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px;
  border-radius: ${cssVarRadius("xl")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  background: ${cssVarColor("backgroundSection")};
  min-width: 0;
  ${BrainBoxShadow}
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`;

export const CardTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const IconBox = styled.span`
  width: 36px;
  height: 36px;
  border-radius: ${cssVarRadius("md")};
  background: ${cssVarColor("primarySubtle")};
  color: ${cssVarColor("primary")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    font-size: 20px;
  }
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: ${cssVarFontSize("h4")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const CardCaption = styled.span`
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textTertiary")};
`;

export const EmptyHint = styled.p`
  margin: 0;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textTertiary")};
`;

export const ErrorHint = styled.p`
  margin: 0;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("errorText")};
`;

/* ─── KPIs ───────────────────────────────────────────────────────────────── */

export const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Kpi = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
  border-radius: ${cssVarRadius("xl")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  background: ${cssVarColor("backgroundSection")};
  min-width: 0;
  ${BrainBoxShadow}
`;

export const KpiTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const Overline = styled.span`
  font-size: 10px;
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("textTertiary")};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

export const KpiValor = styled.div`
  font-size: 30px;
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
  font-variant-numeric: tabular-nums;
  line-height: 1;
`;

const tendenciaCor: Record<Tendencia, string> = {
  alta: cssVarColor("successText"),
  baixa: cssVarColor("errorText"),
  neutra: cssVarColor("textTertiary"),
};

export const KpiDelta = styled.span<{ $tendencia: Tendencia }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: ${cssVarFontSize("small")};
  color: ${({ $tendencia }) => tendenciaCor[$tendencia]};

  svg {
    font-size: 16px;
  }
`;

/* ─── Desempenho por série (barras horizontais) ──────────────────────────── */

export const SerieList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export const SerieRow = styled.div`
  cursor: default;
`;

export const SerieHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("text")};
`;

export const SerieValor = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: ${cssVarFontWeight("semibold")};
  font-variant-numeric: tabular-nums;
  color: ${cssVarColor("text")};

  svg {
    font-size: 16px;
    color: ${cssVarColor("warningText")};
  }
`;

export const Trilho = styled.div`
  height: 8px;
  background: ${cssVarColor("surfaceSunken")};
  border-radius: ${cssVarRadius("pill")};
  overflow: hidden;
`;

export const Preenchimento = styled.div<{ $pct: number; $alerta: boolean }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  border-radius: inherit;
  background: ${({ $alerta }) => ($alerta ? cssVarColor("warning") : cssVarColor("primary"))};
  transition: width 0.3s ease;
`;

/* ─── Frequência mensal (colunas) ────────────────────────────────────────── */

export const Colunas = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 16px;
  height: 150px;
`;

export const Coluna = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  height: 100%;
  cursor: default;
`;

export const ColunaValor = styled.span`
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("textSecondary")};
  font-variant-numeric: tabular-nums;
`;

export const ColunaBarra = styled.div<{ $altura: number }>`
  width: 100%;
  max-width: 36px;
  height: ${({ $altura }) => $altura}%;
  border-radius: 4px 4px 0 0;
  background: ${cssVarColor("primary")};
`;

export const ColunaRotulo = styled.span`
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textTertiary")};
  text-transform: capitalize;
`;

/* ─── Visão geral da rede ────────────────────────────────────────────────── */

export const RedeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 16px;
`;

export const RedeValor = styled.div`
  font-size: 26px;
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
  font-variant-numeric: tabular-nums;
  line-height: 1;
`;

export const RedeRotulo = styled(Overline)`
  display: block;
  margin-top: 6px;
  font-weight: ${cssVarFontWeight("regular")};
`;
