"use client";
import { cssVarColor } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled from "styled-components";

export const PageLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

export const SidebarCard = styled.div`
  position: sticky;
  top: 24px;
  background-color: ${cssVarColor("backgroundSection")};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

export const SidebarHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${cssVarColor("border")};

  h4 {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 600;
    color: ${cssVarColor("textSecondary")};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

export const ResumoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid ${cssVarColor("border")};

  &:last-child {
    border-bottom: none;
  }

  .resumo-label {
    font-size: 0.85rem;
    color: ${cssVarColor("textSecondary")};
  }

  .resumo-value {
    font-size: 0.85rem;
    font-weight: 600;
    color: ${cssVarColor("text")};
  }
`;

export const DisciplinaCheckItem = styled.div<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid ${(props) => (props.$checked ? cssVarColor("primary") : cssVarColor("border"))};
  border-radius: 8px;
  background: ${(props) =>
    props.$checked ? cssVarColor("primary") + "08" : cssVarColor("backgroundSection")};
  cursor: pointer;
  transition: all 0.15s ease;
  ${BrainBoxShadow}

  &:hover {
    border-color: ${cssVarColor("primary")};
  }

  .disc-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .disc-nome {
    font-size: 0.9rem;
    font-weight: 500;
    color: ${cssVarColor("text")};
  }

  .disc-meta {
    font-size: 0.75rem;
    color: ${cssVarColor("textSecondary")};
  }
`;

export const StatsContainer = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${cssVarColor("border")};
  text-align: center;

  .stats-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: ${cssVarColor("text")};
    line-height: 1;
  }

  .stats-label {
    font-size: 0.8rem;
    color: ${cssVarColor("textSecondary")};
    margin-top: 4px;
  }
`;
