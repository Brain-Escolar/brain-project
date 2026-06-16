"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadow, BrainBoxShadowHover } from "@/utils/utilsCss";
import styled from "styled-components";

export const Container = styled.div<{ $clickable?: boolean; $highlight?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  border-radius: ${cssVarRadius("md")};
  padding: 16px;
  width: 100%;
  border: 1px solid
    ${({ $highlight }) => ($highlight ? cssVarColor("primary") : cssVarColor("border"))};
  background: ${({ $highlight }) =>
    $highlight ? cssVarColor("backgroundHover") : cssVarColor("backgroundSection")};
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  transition:
    background 0.2s ease-in,
    border-color 0.2s ease-in,
    box-shadow 0.2s ease-in;
  ${BrainBoxShadow}

  &:hover {
    ${({ $clickable }) => ($clickable ? BrainBoxShadowHover : "")}
  }
`;

export const AreaImage = styled.div`
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: ${cssVarRadius("sm")};
  overflow: hidden;
  background: ${cssVarColor("backgroundHover")};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export const AreaInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
`;

export const AreaTitle = styled.div`
  font-size: ${cssVarFontSize("h4")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
  line-height: 1.3;
`;

export const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 20px;
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
    color: ${cssVarColor("textSecondary")};
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
