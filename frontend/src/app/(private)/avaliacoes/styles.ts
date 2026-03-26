"use client";
import { cssVarColor } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled from "styled-components";

export const Header = styled.div`
  margin-bottom: 32px;
`;

export const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid ${cssVarColor("border")};
`;

export const Tab = styled.button<{ active?: boolean }>`
  background: none;
  border: none;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(props) => (props.active ? cssVarColor("primary") : cssVarColor("textSecondary"))};
  border-bottom: 2px solid ${(props) => (props.active ? cssVarColor("primary") : "transparent")};
  transition: all 0.2s ease;

  &:hover {
    color: ${cssVarColor("primary")};
  }
`;

export const FiltersContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
`;

export const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 300px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid ${cssVarColor("border")};
  border-radius: 6px;
  font-size: 0.875rem;
  background: ${cssVarColor("background")};
  color: ${cssVarColor("text")};

  &::placeholder {
    color: ${cssVarColor("textSecondary")};
  }

  &:focus {
    outline: none;
    border-color: ${cssVarColor("primary")};
  }
`;

export const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${cssVarColor("textSecondary")};
  font-size: 0.875rem;
`;

export const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${cssVarColor("border")};
  border-radius: 6px;
  font-size: 0.875rem;
  background: ${cssVarColor("background")};
  color: ${cssVarColor("text")};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${cssVarColor("primary")};
  }
`;

export const ContentContainer = styled.div`
  display: flex;
  gap: 24px;
`;

export const MainContent = styled.div`
  flex: 1;
`;

export const Sidebar = styled.div`
  width: 300px;
  background: ${cssVarColor("background")};
  border: 1px solid ${cssVarColor("border")};
  border-radius: 8px;
  padding: 20px;
  ${BrainBoxShadow}
  height: fit-content;
`;

export const SidebarTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${cssVarColor("text")};
`;

export const SidebarSubtitle = styled.p`
  margin: 0 0 20px 0;
  font-size: 0.875rem;
  color: ${cssVarColor("textSecondary")};
`;

export const StatCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${cssVarColor("border")};

  &:last-child {
    border-bottom: none;
  }
`;

export const StatLabel = styled.span`
  font-size: 0.875rem;
  color: ${cssVarColor("text")};
`;

export const StatValue = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${cssVarColor("text")};
`;

export const EvaluationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
