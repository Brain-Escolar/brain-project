"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius, cssVarShadow } from "@/styles";
import styled from "styled-components";

export const AvPanel = styled.div`
  background: ${cssVarColor("backgroundSection")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("xl")};
  box-shadow: ${cssVarShadow("level1")};
  padding: 8px;
  display: flex;
  flex-direction: column;
`;

export const AvRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  padding: 14px 16px;
  border-radius: ${cssVarRadius("lg")};
  cursor: pointer;
  transition: background 140ms;

  &:hover {
    background: ${cssVarColor("backgroundHover")};
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

export const AvRowIcon = styled.div`
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

export const AvRowInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;

  @media (max-width: 480px) {
    min-width: 140px;
  }
`;

export const AvRowTitle = styled.div`
  font-size: ${cssVarFontSize("h4")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
  line-height: 1.2;
`;

export const AvRowMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
  flex-wrap: wrap;

  > span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  svg {
    font-size: 18px;
    color: ${cssVarColor("textTertiary")};
  }
`;

export const AvRowRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: 480px) {
    margin-left: 60px;
  }
`;

export const AvRowChevron = styled.div`
  color: ${cssVarColor("textTertiary")};
  display: flex;
  align-items: center;

  svg {
    font-size: 22px;
  }
`;

export const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  align-items: center;
`;

export const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 320px;
  display: flex;
  align-items: center;

  @media (max-width: 600px) {
    max-width: none;
  }
`;

export const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  display: flex;
  color: ${cssVarColor("textTertiary")};

  svg {
    font-size: 20px;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  height: 40px;
  padding: 0 12px 0 40px;
  border: 1px solid ${cssVarColor("border")};
  border-radius: ${cssVarRadius("md")};
  background: ${cssVarColor("backgroundSection")};
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("text")};
  outline: none;
  transition: border-color 140ms, box-shadow 140ms;

  &::placeholder {
    color: ${cssVarColor("textTertiary")};
  }

  &:focus {
    border-color: ${cssVarColor("primary")};
  }
`;

export const FilterSelect = styled.select`
  height: 40px;
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
