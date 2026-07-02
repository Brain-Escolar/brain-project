"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius, cssVarShadow } from "@/styles";
import styled from "styled-components";

export const Seg = styled.div`
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background: ${cssVarColor("surfaceSunken")};
  border-radius: ${cssVarRadius("md")};
  margin-bottom: 24px;
`;

export const SegBtn = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: ${cssVarRadius("sm")};
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("semibold")};
  cursor: pointer;
  background: ${(p) => (p.$active ? cssVarColor("backgroundSection") : "transparent")};
  color: ${(p) => (p.$active ? cssVarColor("text") : cssVarColor("textSecondary"))};
  box-shadow: ${(p) => (p.$active ? cssVarShadow("level1") : "none")};
  transition: background 140ms, color 140ms;

  svg {
    font-size: 18px;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const Main = styled.div`
  max-width: 780px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const SearchBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const FieldLabel = styled.label`
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("medium")};
  color: ${cssVarColor("textSecondary")};
`;

export const FilterSelect = styled.select`
  height: 40px;
  min-width: 160px;
  padding: 0 12px;
  border: 1px solid ${cssVarColor("border")};
  border-radius: ${cssVarRadius("md")};
  font-size: ${cssVarFontSize("body2")};
  background: ${cssVarColor("backgroundSection")};
  color: ${cssVarColor("text")};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${cssVarColor("primary")};
  }
`;

export const ResultCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${cssVarColor("backgroundSection")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("lg")};
  box-shadow: ${cssVarShadow("level1")};
`;

export const ResultIcon = styled.div`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: ${cssVarRadius("md")};
  background: ${cssVarColor("primarySubtle")};
  color: ${cssVarColor("primary")};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    font-size: 24px;
  }
`;

export const ResultBody = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ResultTitle = styled.div`
  font-size: ${cssVarFontSize("h4")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const ResultSub = styled.div`
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
`;

export const ResultFile = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textTertiary")};

  svg {
    font-size: 16px;
  }
`;

export const ResultActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;

export const EmptyHint = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 56px 24px;
  text-align: center;
  color: ${cssVarColor("textTertiary")};
  background: ${cssVarColor("backgroundSection")};
  border: 1px dashed ${cssVarColor("border")};
  border-radius: ${cssVarRadius("lg")};

  svg {
    font-size: 32px;
  }
`;

export const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const SideHead = styled.h3`
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
  margin: 0;
`;

export const HList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: ${cssVarColor("backgroundSection")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("lg")};
  padding: 6px;
`;

export const HRow = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: ${cssVarRadius("sm")};
  cursor: pointer;
  text-align: left;
  transition: background 140ms;

  &:hover {
    background: ${cssVarColor("backgroundHover")};
  }

  svg:first-child {
    font-size: 18px;
    color: ${cssVarColor("textTertiary")};
    flex-shrink: 0;
  }
`;

export const HRowMain = styled.span`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  b {
    font-size: ${cssVarFontSize("body2")};
    font-weight: ${cssVarFontWeight("medium")};
    color: ${cssVarColor("text")};
  }

  span {
    font-size: ${cssVarFontSize("small")};
    color: ${cssVarColor("textTertiary")};
  }
`;

export const HRowChevron = styled.span`
  display: flex;
  color: ${cssVarColor("textTertiary")};
  flex-shrink: 0;

  svg {
    font-size: 18px;
  }
`;
