"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled from "styled-components";

export const ResumoContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${cssVarRadius("xl")};
  padding: 24px;
  border: 1px solid ${cssVarColor("borderSubtle")};
  background: ${cssVarColor("backgroundSection")};
  min-height: 534px;
  width: 100%;
  gap: 24px;
  ${BrainBoxShadow}
`;

export const ResumoHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ResumoTitle = styled.h3`
  margin: 0;
  font-size: ${cssVarFontSize("h3")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const ResumoSubtitle = styled.p`
  margin: 0;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
  line-height: 1.4;
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const SectionTitle = styled.h4`
  margin: 0;
  font-size: ${cssVarFontSize("body1")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const CountBadge = styled.span`
  background: ${cssVarColor("primarySubtle")};
  color: ${cssVarColor("primary")};
  border-radius: 12px;
  padding: 2px 8px;
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("medium")};
`;

export const Card = styled.div`
  padding: 12px;
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("lg")};
  background: ${cssVarColor("background")};
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.2s ease, background 0.14s ease;

  &:hover {
    border-color: ${cssVarColor("primary")};
    background: ${cssVarColor("primarySubtle")};
  }
`;

export const CardTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

export const CardTitle = styled.span`
  font-weight: ${cssVarFontWeight("semibold")};
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("text")};
`;

export const CardBadge = styled.span`
  background: ${cssVarColor("backgroundHover")};
  color: ${cssVarColor("textSecondary")};
  border-radius: 4px;
  padding: 2px 8px;
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("medium")};
  white-space: nowrap;
`;

export const CardMeta = styled.span`
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textSecondary")};
`;

export const CardDescription = styled.p`
  margin: 0;
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textSecondary")};
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const CardDeadline = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textSecondary")};
`;
