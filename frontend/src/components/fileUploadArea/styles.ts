"use client";
import { cssVarColor } from "@/styles";
import styled from "styled-components";

export const UploadArea = styled.div<{ $hasFile?: boolean }>`
  border: 2px dashed ${(p) => (p.$hasFile ? cssVarColor("primary") : cssVarColor("border"))};
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background: ${(p) => (p.$hasFile ? "rgba(0, 120, 212, 0.04)" : cssVarColor("background"))};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${cssVarColor("primary")};
    background: rgba(0, 120, 212, 0.04);
  }
`;

export const UploadLabel = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${cssVarColor("textSecondary")};
  text-align: center;
`;

export const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
`;

export const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: ${cssVarColor("text")};
  border: 1px solid ${cssVarColor("border")};
  border-radius: 6px;
  padding: 6px 10px;
`;

export const FileName = styled.span`
  flex: 1;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
