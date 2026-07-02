"use client";

import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius, cssVarShadow } from "@/styles";
import styled from "styled-components";

export const Panel = styled.div`
  background: ${cssVarColor("backgroundSection")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("xl")};
  box-shadow: ${cssVarShadow("level1")};
  padding: 8px;
  display: flex;
  flex-direction: column;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-radius: ${cssVarRadius("lg")};

  & + & {
    border-top: 1px solid ${cssVarColor("borderSubtle")};
  }
`;

export const RowIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${cssVarRadius("md")};
  background: ${cssVarColor("primarySubtle")};
  color: ${cssVarColor("primary")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const RowInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const RowTitle = styled.div`
  font-size: ${cssVarFontSize("body1")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const RowMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textSecondary")};
  flex-wrap: wrap;

  > span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  svg {
    font-size: 16px;
    color: ${cssVarColor("textTertiary")};
  }
`;

export const RowRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;
