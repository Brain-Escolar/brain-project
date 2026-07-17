"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled, { css } from "styled-components";
import type { DisciplinaTagTone } from "@/utils/disciplinaUtils";

export const SidebarStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

export const PanelCard = styled.div`
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
  gap: 8px;
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

export const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const TarefaCard = styled.button`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("md")};
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  width: 100%;
  transition: border-color 0.15s ease, background 0.15s ease;

  &:hover {
    border-color: ${cssVarColor("secondary")};
    background: ${cssVarColor("primarySubtle")};
  }
`;

export const CardTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

const tagToneStyles: Record<DisciplinaTagTone, ReturnType<typeof css>> = {
  green: css`
    background: ${cssVarColor("successSubtle")};
    color: ${cssVarColor("successText")};
  `,
  orange: css`
    background: ${cssVarColor("warningSubtle")};
    color: ${cssVarColor("warningText")};
  `,
  blue: css`
    background: ${cssVarColor("infoSubtle")};
    color: ${cssVarColor("infoText")};
  `,
  neutral: css`
    background: ${cssVarColor("backgroundHover")};
    color: ${cssVarColor("textSecondary")};
  `,
};

export const SubjectTag = styled.span<{ $tone: DisciplinaTagTone }>`
  border-radius: ${cssVarRadius("pill")};
  padding: 3px 10px;
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("semibold")};
  white-space: nowrap;
  ${({ $tone }) => tagToneStyles[$tone]}
`;

export const CardDeadline = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("medium")};
  color: ${cssVarColor("textSecondary")};
  white-space: nowrap;

  svg {
    font-size: 14px;
  }
`;

export const CardTitle = styled.span`
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("medium")};
  color: ${cssVarColor("text")};
  line-height: 1.35;
`;

export const ComunicadoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const ComunicadoRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

export const ComunicadoIcon = styled.div`
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

export const ComunicadoBody = styled.div`
  min-width: 0;
`;

export const ComunicadoTitle = styled.div`
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("medium")};
  color: ${cssVarColor("text")};
  line-height: 1.35;
`;

export const ComunicadoMeta = styled.div`
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textTertiary")};
  margin-top: 2px;
`;

export const EmptyHint = styled.p`
  margin: 0;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textTertiary")};
`;
