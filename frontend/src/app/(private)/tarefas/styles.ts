"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius, cssVarShadow } from "@/styles";
import styled from "styled-components";

export const Seg = styled.div`
  display: inline-flex;
  padding: 4px;
  gap: 2px;
  background: ${cssVarColor("backgroundHover")};
  border-radius: ${cssVarRadius("md")};
  margin-bottom: 20px;
`;

export const SegButton = styled.button<{ $active: boolean }>`
  border: none;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: ${cssVarRadius("sm")};
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("semibold")};
  background: ${(p) => (p.$active ? cssVarColor("backgroundSection") : "transparent")};
  color: ${(p) => (p.$active ? cssVarColor("text") : cssVarColor("textSecondary"))};
  box-shadow: ${(p) => (p.$active ? cssVarShadow("level1") : "none")};
  transition: background 140ms, color 140ms;
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
  font-size: 0.875rem;
`;

export const SearchInput = styled.input`
  width: 100%;
  height: 40px;
  padding: 0 12px 0 36px;
  border: 1px solid ${cssVarColor("border")};
  border-radius: ${cssVarRadius("md")};
  font-size: ${cssVarFontSize("body2")};
  background: ${cssVarColor("backgroundSection")};
  color: ${cssVarColor("text")};

  &::placeholder {
    color: ${cssVarColor("textTertiary")};
  }

  &:focus {
    outline: none;
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

export const ListPanel = styled.div`
  background: ${cssVarColor("backgroundSection")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("xl")};
  box-shadow: ${cssVarShadow("level1")};
  padding: 8px;
  display: flex;
  flex-direction: column;
`;

export const ContentContainer = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

export const MainContent = styled.div`
  flex: 1;
  min-width: 0;
  width: 100%;
`;

export const Sidebar = styled.div`
  width: 280px;
  flex-shrink: 0;
  background: ${cssVarColor("backgroundSection")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("xl")};
  box-shadow: ${cssVarShadow("level1")};
  padding: 20px;
  height: fit-content;

  @media (max-width: 900px) {
    width: 100%;
  }
`;

export const SidebarTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: ${cssVarFontSize("h4")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const SidebarSubtitle = styled.p`
  margin: 0 0 20px 0;
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textSecondary")};
`;

export const StatCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${cssVarColor("borderSubtle")};

  &:last-child {
    border-bottom: none;
  }
`;

export const StatLabel = styled.span`
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
`;

export const StatValue = styled.span`
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;
