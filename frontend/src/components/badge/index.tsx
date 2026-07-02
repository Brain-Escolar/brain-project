"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import styled from "styled-components";

export type BadgeTone = "primary" | "info" | "neutral" | "warning" | "success" | "error";

const toneStyles: Record<BadgeTone, { bg: string; color: string }> = {
  primary: { bg: cssVarColor("primarySubtle"), color: cssVarColor("primary") },
  info: { bg: cssVarColor("infoSubtle"), color: cssVarColor("infoText") },
  neutral: { bg: cssVarColor("backgroundHover"), color: cssVarColor("textSecondary") },
  warning: { bg: cssVarColor("warningSubtle"), color: cssVarColor("warningText") },
  success: { bg: cssVarColor("successSubtle"), color: cssVarColor("successText") },
  error: { bg: cssVarColor("errorSubtle"), color: cssVarColor("errorText") },
};

const Badge = styled.span<{ $tone: BadgeTone }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: ${cssVarRadius("pill")};
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("semibold")};
  white-space: nowrap;
  background: ${(p) => toneStyles[p.$tone].bg};
  color: ${(p) => toneStyles[p.$tone].color};
`;

export default Badge;
