"use client";
import { cssVarColor } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled from "styled-components";

export const Card = styled.div`
  background: ${cssVarColor("background")};
  border: 1px solid ${cssVarColor("border")};
  border-radius: 8px;
  padding: 20px;
  ${BrainBoxShadow}
  transition: all 0.2s ease;

  &:hover {
    border-color: ${cssVarColor("primary")};
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${cssVarColor("text")};
`;

export const StatusBadge = styled.span<{ status: "pending" | "review" | "completed" }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;

  ${(props) => {
    switch (props.status) {
      case "pending":
        return `
          background: #FFF3CD;
          color: #856404;
        `;
      case "review":
        return `
          background: #CCE5FF;
          color: #0056B3;
        `;
      case "completed":
        return `
          background: #D4EDDA;
          color: #155724;
        `;
      default:
        return `
          background: ${cssVarColor("backgroundHover")};
          color: ${cssVarColor("text")};
        `;
    }
  }}
`;

export const CardSubject = styled.div`
  font-size: 0.875rem;
  color: ${cssVarColor("textSecondary")};
  margin-bottom: 8px;
`;

export const CardMeta = styled.div`
  font-size: 0.875rem;
  color: ${cssVarColor("textSecondary")};
  margin-bottom: 16px;
`;

export const ProgressContainer = styled.div`
  margin-bottom: 8px;
`;

export const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: ${cssVarColor("textSecondary")};
  margin-bottom: 4px;
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${cssVarColor("backgroundHover")};
  border-radius: 3px;
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: ${cssVarColor("primary")};
  width: ${(props) => props.progress}%;
  transition: width 0.3s ease;
`;

export const CardDates = styled.div`
  display: flex;
  gap: 16px;
  font-size: 0.75rem;
  color: ${cssVarColor("textSecondary")};
`;

export const DateItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const DateIcon = styled.span`
  font-size: 0.875rem;
`;
