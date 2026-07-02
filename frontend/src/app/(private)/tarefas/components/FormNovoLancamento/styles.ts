"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius, cssVarShadow } from "@/styles";
import styled from "styled-components";

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const MainPanel = styled.div`
  background: ${cssVarColor("backgroundSection")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("xl")};
  box-shadow: ${cssVarShadow("level1")};
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const SelectRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;

  > * {
    flex: 1;
    min-width: 160px;
  }
`;

export const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: ${cssVarColor("backgroundHover")};
  border-radius: ${cssVarRadius("md")};
`;

export const ToggleText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  b {
    font-size: ${cssVarFontSize("body2")};
    color: ${cssVarColor("text")};
  }

  span {
    font-size: ${cssVarFontSize("small")};
    color: ${cssVarColor("textSecondary")};
  }
`;

export const PrazoBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: ${cssVarRadius("md")};
  background: ${cssVarColor("infoSubtle")};
  color: ${cssVarColor("infoText")};
  font-size: ${cssVarFontSize("body2")};

  svg {
    font-size: 20px;
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

export const SidePanel = styled.div`
  background: ${cssVarColor("backgroundSection")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("xl")};
  box-shadow: ${cssVarShadow("level1")};
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const SideHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  h3 {
    margin: 0;
    font-size: ${cssVarFontSize("h4")};
    font-weight: ${cssVarFontWeight("semibold")};
    color: ${cssVarColor("text")};
  }

  p {
    margin: 2px 0 0;
    font-size: ${cssVarFontSize("small")};
    color: ${cssVarColor("textSecondary")};
  }
`;

export const SelectAllButton = styled.button`
  border: none;
  background: none;
  color: ${cssVarColor("primary")};
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("semibold")};
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

export const TurmaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 520px;
  overflow-y: auto;
`;

export const TurmaRow = styled.div<{ $selected: boolean }>`
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("md")};
  padding: 10px 12px;
  opacity: ${(p) => (p.$selected ? 1 : 0.55)};
  transition: opacity 140ms;
`;

export const TurmaRowHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const TurmaName = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;

  b {
    font-size: ${cssVarFontSize("body2")};
    color: ${cssVarColor("text")};
  }

  span {
    font-size: ${cssVarFontSize("small")};
    color: ${cssVarColor("textSecondary")};
  }
`;

export const EmptyTurmas = styled.div`
  padding: 24px 8px;
  text-align: center;
  color: ${cssVarColor("textTertiary")};
  font-size: ${cssVarFontSize("body2")};
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
`;
