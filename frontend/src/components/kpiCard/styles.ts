"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled from "styled-components";
import type { BadgeTone } from "@/components/badge";

const toneBg: Record<BadgeTone, string> = {
  primary: cssVarColor("primarySubtle"),
  info: cssVarColor("infoSubtle"),
  neutral: cssVarColor("surfaceSunken"),
  warning: cssVarColor("warningSubtle"),
  success: cssVarColor("successSubtle"),
  error: cssVarColor("errorSubtle"),
};

const toneFg: Record<BadgeTone, string> = {
  primary: cssVarColor("primary"),
  info: cssVarColor("infoText"),
  neutral: cssVarColor("textTertiary"),
  warning: cssVarColor("warningText"),
  success: cssVarColor("successText"),
  error: cssVarColor("errorText"),
};

export const Card = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid ${cssVarColor("border")};
  border-radius: ${cssVarRadius("md")};
  background: ${cssVarColor("backgroundSection")};
  ${BrainBoxShadow}
`;

export const IconBox = styled.span<{ $tone: BadgeTone }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: ${cssVarRadius("sm")};
  background: ${(p) => toneBg[p.$tone]};
  color: ${(p) => toneFg[p.$tone]};
`;

export const Valor = styled.div`
  font-size: ${cssVarFontSize("h3")};
  font-weight: ${cssVarFontWeight("bold")};
  line-height: 1.1;
  color: ${cssVarColor("text")};
  /* O design usa monoespaçada nos números; aqui mantemos a Hanken Grotesk
     (fonte oficial do produto) e alinhamos as colunas com tabular-nums. */
  font-variant-numeric: tabular-nums;
`;

export const Rotulo = styled.div`
  margin-top: 2px;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
`;
