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
  margin-bottom: 16px;
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${cssVarColor("text")};
`;

export const DisciplinaChip = styled.span`
  background: ${cssVarColor("backgroundHover")};
  color: ${cssVarColor("textSecondary")};
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
`;

export const SubTitle = styled.div`
  font-size: 0.8rem;
  color: ${cssVarColor("textSecondary")};
  margin-bottom: 12px;
`;

export const FileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: ${cssVarColor("textSecondary")};
`;

export const FileName = styled.span`
  font-size: 0.85rem;
  color: ${cssVarColor("text")};
  font-weight: 500;
`;

export const FileMeta = styled.span`
  font-size: 0.75rem;
  color: ${cssVarColor("textSecondary")};
`;

export const Content = styled.p`
  margin: 0 0 12px;
  font-size: 0.85rem;
  color: ${cssVarColor("textSecondary")};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const DateRow = styled.div`
  display: flex;
  gap: 20px;
  font-size: 0.75rem;
  color: ${cssVarColor("textSecondary")};
`;

export const DateItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;
