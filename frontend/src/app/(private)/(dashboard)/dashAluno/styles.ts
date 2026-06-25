"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled, { css } from "styled-components";
import type { AnotacaoBadgeVariant } from "@/utils/anotacaoBadgeUtils";
import type { DisciplinaTagTone } from "@/utils/disciplinaUtils";

export const ResumoContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${cssVarRadius("xl")};
  padding: 20px;
  border: 1px solid ${cssVarColor("borderSubtle")};
  background: ${cssVarColor("backgroundSection")};
  width: 100%;
  gap: 20px;
  ${BrainBoxShadow}
`;

export const ResumoHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ResumoTitle = styled.h3`
  margin: 0;
  font-family: var(--fonts-heading);
  font-size: ${cssVarFontSize("h4")};
  font-weight: ${cssVarFontWeight("bold")};
  color: ${cssVarColor("text")};
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const SectionTitle = styled.h4`
  margin: 0;
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const CountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: ${cssVarRadius("pill")};
  background: ${cssVarColor("primary")};
  color: #fff;
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("semibold")};
  line-height: 1;
`;

export const Card = styled.div`
  padding: 14px 16px;
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("md")};
  background: ${cssVarColor("backgroundSection")};
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const CardTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
`;

export const CardTitle = styled.span`
  font-weight: ${cssVarFontWeight("semibold")};
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("text")};
`;

const statusBadgeStyles: Record<AnotacaoBadgeVariant, ReturnType<typeof css>> = {
  success: css`
    background: ${cssVarColor("successSubtle")};
    color: ${cssVarColor("successText")};
    border: 1px solid rgba(22, 163, 74, 0.25);
  `,
  warning: css`
    background: ${cssVarColor("warningSubtle")};
    color: ${cssVarColor("warningText")};
    border: 1px solid rgba(245, 158, 11, 0.35);
  `,
  neutral: css`
    background: ${cssVarColor("backgroundHover")};
    color: ${cssVarColor("textSecondary")};
    border: 1px solid ${cssVarColor("borderSubtle")};
  `,
};

export const StatusBadge = styled.span<{ $variant: AnotacaoBadgeVariant }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: ${cssVarRadius("pill")};
  padding: 3px 10px;
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("medium")};
  white-space: nowrap;
  ${({ $variant }) => statusBadgeStyles[$variant]}

  svg {
    font-size: 14px;
  }
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
  font-weight: ${cssVarFontWeight("medium")};
  white-space: nowrap;
  ${({ $tone }) => tagToneStyles[$tone]}
`;

export const CardMeta = styled.span`
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textTertiary")};
`;

export const CardDescription = styled.p`
  margin: 0;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
  line-height: 1.45;
`;

export const CardDeadline = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textTertiary")};
  white-space: nowrap;

  svg {
    font-size: 14px;
  }
`;

export const EmptyHint = styled.p`
  margin: 0;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textTertiary")};
`;

export const DesempenhoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const MediaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const MediaLabel = styled.span`
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
`;

export const MediaValue = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  padding: 6px 12px;
  border-radius: ${cssVarRadius("md")};
  border: 1px solid rgba(22, 163, 74, 0.35);
  background: ${cssVarColor("successSubtle")};
  color: ${cssVarColor("success")};
  font-size: ${cssVarFontSize("body1")};
  font-weight: ${cssVarFontWeight("bold")};
`;

export const ProgressBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const ProgressHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const ProgressLabel = styled.span`
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
`;

export const ProgressValue = styled.span`
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const ProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  border-radius: ${cssVarRadius("pill")};
  background: ${cssVarColor("surfaceSunken")};
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ $value: number; $tone: "success" | "primary" }>`
  height: 100%;
  width: ${({ $value }) => Math.min(Math.max($value, 0), 100)}%;
  border-radius: inherit;
  background: ${({ $tone }) =>
    $tone === "success" ? cssVarColor("success") : cssVarColor("primary")};
  transition: width 0.2s ease;
`;
