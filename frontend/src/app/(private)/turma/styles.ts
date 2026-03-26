"use client";
import { cssVarColor } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled from "styled-components";

export const AreaAssignments = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  border-radius: 8px;
  padding: 20px 16px;
  gap: 12px;
  border: 1px solid ${cssVarColor("border")};
  min-height: 534px;
  width: 100%;
  ${BrainBoxShadow}
`;

export const PageLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
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

export const OcupacaoContainer = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${cssVarColor("border")};
  text-align: center;

  .ocupacao-numero {
    font-size: 2.5rem;
    font-weight: 700;
    color: ${cssVarColor("text")};
    line-height: 1;
  }

  .ocupacao-label {
    font-size: 0.8rem;
    color: ${cssVarColor("textSecondary")};
    margin-top: 4px;
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

export const TurnoGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
`;

export const TurnoOption = styled.button<{ $active: boolean }>`
  padding: 10px 16px;
  border: 1px solid
    ${(props) => (props.$active ? cssVarColor("primary") : cssVarColor("border"))};
  border-radius: 8px;
  background: ${(props) =>
    props.$active ? cssVarColor("primary") : cssVarColor("backgroundSection")};
  color: ${(props) => (props.$active ? "#fff" : cssVarColor("text"))};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${cssVarColor("primary")};
  }
`;

export const GradeCard = styled.div<{ $active: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid
    ${(props) => (props.$active ? cssVarColor("primary") : cssVarColor("border"))};
  border-radius: 8px;
  background: ${(props) =>
    props.$active ? cssVarColor("primary") + "08" : cssVarColor("backgroundSection")};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${cssVarColor("primary")};
  }

  .grade-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .grade-nome {
    font-size: 0.9rem;
    font-weight: 500;
    color: ${cssVarColor("text")};
  }

  .grade-meta {
    font-size: 0.75rem;
    color: ${cssVarColor("textSecondary")};
  }

  .grade-versao {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${cssVarColor("textSecondary")};
    white-space: nowrap;
  }
`;
