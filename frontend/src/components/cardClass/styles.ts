"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled from "styled-components";

/**
 * Painel que agrupa as linhas de aula (CardClass) num único cartão,
 * conforme o protótipo do Design System (`.bk-classpanel`).
 */
export const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 8px;
  background: ${cssVarColor("backgroundSection")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("xl")};
  ${BrainBoxShadow}
`;

export const Container = styled.div<{ $clickable?: boolean; $highlight?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  border-radius: ${cssVarRadius("lg")};
  padding: 16px;
  width: 100%;
  background: ${({ $highlight }) =>
    $highlight ? cssVarColor("primarySubtle") : "transparent"};
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  transition: background 0.14s ease;

  &:hover {
    background: ${({ $clickable, $highlight }) =>
      !$clickable
        ? $highlight
          ? cssVarColor("primarySubtle")
          : "transparent"
        : $highlight
          ? cssVarColor("primarySubtleHover")
          : cssVarColor("backgroundHover")};
  }
`;

export const AreaImage = styled.div`
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: ${cssVarRadius("md")};
  overflow: hidden;
  background: ${cssVarColor("surfaceSunken")};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export const AreaIcon = styled.div`
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: ${cssVarRadius("md")};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${cssVarColor("surfaceSunken")};
`;

export const AreaInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

export const AreaTitle = styled.div`
  font-size: ${cssVarFontSize("body1")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
  line-height: 1.25;
`;

export const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 22px;
  color: ${cssVarColor("textSecondary")};
  font-size: ${cssVarFontSize("body2")};
`;

export const MetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1.5;

  svg {
    font-size: 18px;
    color: ${cssVarColor("textTertiary")};
  }
`;

export const Badge = styled.span`
  align-self: flex-start;
  flex-shrink: 0;
  color: ${cssVarColor("primary")};
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("semibold")};
  white-space: nowrap;
`;
