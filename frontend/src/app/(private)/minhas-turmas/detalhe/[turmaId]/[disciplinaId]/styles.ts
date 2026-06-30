"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled from "styled-components";

export const BackLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  background: none;
  border: none;
  cursor: pointer;
  color: ${cssVarColor("textSecondary")};
  font-family: inherit;
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("medium")};
  padding: 2px 0;
  margin-bottom: 12px;

  &:hover {
    color: ${cssVarColor("primary")};
  }
`;

export const KpisRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const KpiCard = styled.div`
  background: ${cssVarColor("background")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("lg")};
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  ${BrainBoxShadow}
`;

export const KpiTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const KpiLabel = styled.span`
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("medium")};
  color: ${cssVarColor("textSecondary")};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const KPI_ICON_COLORS = {
  primary: { bg: cssVarColor("primarySubtle"), fg: cssVarColor("primary") },
  success: { bg: cssVarColor("successSubtle"), fg: cssVarColor("success") },
  info: { bg: cssVarColor("infoSubtle"), fg: cssVarColor("info") },
};

export const KpiIcon = styled.span<{ $tone: keyof typeof KPI_ICON_COLORS }>`
  width: 36px;
  height: 36px;
  border-radius: ${cssVarRadius("md")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ $tone }) => KPI_ICON_COLORS[$tone].bg};
  color: ${({ $tone }) => KPI_ICON_COLORS[$tone].fg};
`;

export const KpiValue = styled.div`
  font-size: 28px;
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
  line-height: 1;
  font-variant-numeric: tabular-nums;
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

export const TableCard = styled.div`
  background: ${cssVarColor("background")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("lg")};
  overflow: hidden;
  ${BrainBoxShadow}
`;

export const StudentName = styled.div`
  font-weight: ${cssVarFontWeight("semibold")};
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("text")};
`;

export const StudentId = styled.div`
  font-size: 11px;
  color: ${cssVarColor("textTertiary")};
  margin-top: 1px;
`;

export const NumValue = styled.span<{ $bad?: boolean }>`
  font-weight: ${cssVarFontWeight("semibold")};
  font-variant-numeric: tabular-nums;
  color: ${({ $bad }) => ($bad ? cssVarColor("error") : cssVarColor("text"))};
`;

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 320px) 1fr;
  gap: 28px;
  padding: 20px 18px;
  background: ${cssVarColor("surfaceSunken")};

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const BlockTitle = styled.div`
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("textSecondary")};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 14px;
`;

export const NotasList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const NotaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
`;

export const AnotacaoRow = styled.div`
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px dashed ${cssVarColor("borderSubtle")};

  &:last-child {
    border-bottom: none;
  }
`;

export const AnotacaoDate = styled.div`
  font-size: 11px;
  color: ${cssVarColor("textTertiary")};
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 42px;
  padding-top: 3px;
`;

export const AnotacaoBody = styled.div`
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
  line-height: 1.45;
`;

export const DetailActions = styled.div`
  grid-column: 1 / -1;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  border-top: 1px solid ${cssVarColor("borderSubtle")};
  padding-top: 16px;
`;
