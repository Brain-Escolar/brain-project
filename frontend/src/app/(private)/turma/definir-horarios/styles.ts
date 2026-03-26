"use client";
import { cssVarColor } from "@/styles";
import styled from "styled-components";

export const HorarioGrid = styled.div`
  width: 100%;
  overflow-x: auto;
`;

export const GridTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;

  th,
  td {
    border: 1px solid ${cssVarColor("border")};
    padding: 8px 10px;
    text-align: center;
    font-size: 0.8rem;
    vertical-align: top;
  }

  th {
    background-color: ${cssVarColor("backgroundSection")};
    font-weight: 600;
    color: ${cssVarColor("textSecondary")};
    text-transform: uppercase;
    letter-spacing: 0.3px;
    font-size: 0.75rem;
    padding: 12px 10px;
  }

  th:first-child {
    width: 120px;
    text-align: left;
  }
`;

export const CellContent = styled.div<{ $filled: boolean }>`
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: ${(props) =>
    props.$filled ? cssVarColor("primary") + "10" : "transparent"};
  border: 1px solid ${(props) => (props.$filled ? cssVarColor("primary") + "40" : "transparent")};

  &:hover {
    background: ${cssVarColor("primary") + "08"};
    border-color: ${cssVarColor("primary")};
  }

  .cell-disciplina {
    font-weight: 600;
    font-size: 0.78rem;
    color: ${cssVarColor("text")};
  }

  .cell-professor {
    font-size: 0.7rem;
    color: ${cssVarColor("textSecondary")};
  }

  .cell-empty {
    font-size: 0.75rem;
    color: ${cssVarColor("textSecondary")};
    opacity: 0.5;
  }
`;

export const HorarioLabel = styled.div`
  text-align: left;

  .horario-nome {
    font-weight: 600;
    font-size: 0.8rem;
    color: ${cssVarColor("text")};
  }

  .horario-periodo {
    font-size: 0.7rem;
    color: ${cssVarColor("textSecondary")};
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

export const PageLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;
