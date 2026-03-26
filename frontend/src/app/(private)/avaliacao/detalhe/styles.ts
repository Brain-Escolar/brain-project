"use client";
import styled from "styled-components";
import { cssVarColor } from "@/styles";

export const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px 0;
  max-width: 1440px;
  width: 100%;
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 16px;
  width: 100%;
`;

export const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
`;

export const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${cssVarColor("textSecondary")};
  font-size: 0.875rem;
`;

export const ProgressWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 200px;
`;
