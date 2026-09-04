"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled from "styled-components";

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

export const FiltrosCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  padding: 20px;
  border-radius: ${cssVarRadius("xl")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  background: ${cssVarColor("backgroundSection")};
  ${BrainBoxShadow}
`;

export const FiltrosHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const FiltrosResumo = styled.span`
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
`;

export const FiltroRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: minmax(0, 1fr);
  }
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

/* ─── Modo compacto (card de dashboard) ──────────────────────────────────── */

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
