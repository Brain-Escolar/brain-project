"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import styled from "styled-components";

export const DisciplinasList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 34px;
`;

export const DisciplinaSection = styled.section``;

export const DisciplinaHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

export const DisciplinaIconBox = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${cssVarRadius("md")};
  background: ${cssVarColor("primarySubtle")};
  color: ${cssVarColor("primary")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const DisciplinaName = styled.div`
  font-size: ${cssVarFontSize("h4")};
  font-weight: ${cssVarFontWeight("semibold")};
`;

export const DisciplinaCount = styled.div`
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textTertiary")};
  margin-top: 1px;
`;

export const TurmasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;
