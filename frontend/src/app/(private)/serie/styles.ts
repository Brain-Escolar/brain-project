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
