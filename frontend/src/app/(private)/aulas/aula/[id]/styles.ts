"use client";
import { cssVarColor } from "@/styles";
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
    text-align: right;
    max-width: 180px;
  }
`;
