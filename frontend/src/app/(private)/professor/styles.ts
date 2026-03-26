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

export const EmptyDependentesContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  gap: 8px;
  border: 1.5px dashed ${cssVarColor("border")};
  border-radius: 8px;
  color: ${cssVarColor("textSecondary")};
  font-size: 0.875rem;
  width: 100%;
  text-align: center;
`;

export const UploadArea = styled.label<{ $hasFile?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  gap: 8px;
  border: 2px dashed
    ${({ $hasFile }) => ($hasFile ? cssVarColor("accent") : cssVarColor("border"))};
  border-radius: 8px;
  cursor: pointer;
  background-color: ${({ $hasFile }) =>
    $hasFile ? "rgba(16, 185, 129, 0.04)" : "transparent"};
  transition: border-color 0.2s, background-color 0.2s;
  width: 100%;

  &:hover {
    border-color: ${cssVarColor("primary")};
    background-color: rgba(59, 130, 246, 0.04);
  }

  input {
    display: none;
  }

  span {
    font-size: 0.875rem;
    color: ${cssVarColor("textSecondary")};
  }

  strong {
    font-size: 0.875rem;
    color: ${cssVarColor("primary")};
  }
`;

export const LgpdContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0 16px;
`;

export const FooterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 8px;
`;
