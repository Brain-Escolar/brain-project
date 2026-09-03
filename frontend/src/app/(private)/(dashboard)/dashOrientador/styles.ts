"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled, { css } from "styled-components";

/** Tom de destaque de um indicador — neutro por padrão, atenção quando há pendência. */
export type IndicadorTone = "neutral" | "attention" | "positive";

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

export const PanelCard = styled.section`
  display: flex;
  flex-direction: column;
  border-radius: ${cssVarRadius("xl")};
  padding: 20px;
  border: 1px solid ${cssVarColor("borderSubtle")};
  background: ${cssVarColor("backgroundSection")};
  width: 100%;
  gap: 14px;
  ${BrainBoxShadow}
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const PanelTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const PanelTitle = styled.h3`
  margin: 0;
  font-size: ${cssVarFontSize("body1")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const CountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: ${cssVarRadius("pill")};
  background: ${cssVarColor("primarySubtle")};
  color: ${cssVarColor("primary")};
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("bold")};
  line-height: 1;
`;

export const PanelActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const LinkButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("primary")};
  white-space: nowrap;

  &:hover {
    color: ${cssVarColor("primaryHover")};
    text-decoration: underline;
  }
`;

/* ─── Indicadores ────────────────────────────────────────────────────────── */

export const IndicadorGrid = styled.div`
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

const indicadorToneStyles: Record<IndicadorTone, ReturnType<typeof css>> = {
  neutral: css`
    background: ${cssVarColor("surfaceSunken")};
    color: ${cssVarColor("textSecondary")};
  `,
  attention: css`
    background: ${cssVarColor("warningSubtle")};
    color: ${cssVarColor("warningText")};
  `,
  positive: css`
    background: ${cssVarColor("primarySubtle")};
    color: ${cssVarColor("primary")};
  `,
};

export const IndicadorCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: ${cssVarRadius("xl")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  background: ${cssVarColor("backgroundSection")};
  ${BrainBoxShadow}
`;

export const IndicadorIcon = styled.div<{ $tone: IndicadorTone }>`
  width: 42px;
  height: 42px;
  border-radius: ${cssVarRadius("md")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  ${({ $tone }) => indicadorToneStyles[$tone]}

  svg {
    font-size: 22px;
  }
`;

export const IndicadorBody = styled.div`
  min-width: 0;
`;

export const IndicadorValor = styled.div`
  font-size: ${cssVarFontSize("h3")};
  font-weight: ${cssVarFontWeight("bold")};
  color: ${cssVarColor("text")};
  line-height: 1.1;
`;

export const IndicadorLabel = styled.div`
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
  margin-top: 2px;
`;

/* ─── Listas ─────────────────────────────────────────────────────────────── */

export const RowList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Row = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: ${cssVarRadius("md")};
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: background 0.15s ease;

  &:hover {
    background: ${cssVarColor("backgroundHover")};
  }
`;

export const RowIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: ${cssVarRadius("pill")};
  background: ${cssVarColor("surfaceSunken")};
  color: ${cssVarColor("textSecondary")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    font-size: 18px;
  }
`;

export const RowBody = styled.div`
  flex: 1;
  min-width: 0;
`;

export const RowTitle = styled.div`
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("medium")};
  color: ${cssVarColor("text")};
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RowMeta = styled.div`
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textTertiary")};
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RowAside = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

export const UnreadDot = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: ${cssVarRadius("pill")};
  background: ${cssVarColor("primary")};
  color: #fff;
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("bold")};
  line-height: 1;
`;

export type StatusTone = "open" | "closed";

export const StatusTag = styled.span<{ $tone: StatusTone }>`
  border-radius: ${cssVarRadius("pill")};
  padding: 3px 10px;
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("semibold")};
  white-space: nowrap;

  ${({ $tone }) =>
    $tone === "open"
      ? css`
          background: ${cssVarColor("successSubtle")};
          color: ${cssVarColor("successText")};
        `
      : css`
          background: ${cssVarColor("surfaceSunken")};
          color: ${cssVarColor("textSecondary")};
        `}
`;

/* ─── Busca de alunos ────────────────────────────────────────────────────── */

export const FiltroRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const AtalhoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const AtalhoChip = styled.button<{ $ativo?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: ${cssVarRadius("pill")};
  border: 1px solid
    ${({ $ativo }) => ($ativo ? cssVarColor("primary") : cssVarColor("borderSubtle"))};
  background: ${({ $ativo }) =>
    $ativo ? cssVarColor("primarySubtle") : cssVarColor("backgroundSection")};
  color: ${({ $ativo }) => ($ativo ? cssVarColor("primary") : cssVarColor("textSecondary"))};
  font-family: inherit;
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("medium")};
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: ${cssVarColor("primarySubtle")};
    border-color: ${cssVarColor("secondary")};
  }

  svg {
    font-size: 16px;
  }
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
