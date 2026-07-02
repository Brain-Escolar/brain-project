"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius, cssVarShadow } from "@/styles";
import styled from "styled-components";

export const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0 20px;
`;

export const BackLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  background: none;
  border: none;
  cursor: pointer;
  color: ${cssVarColor("textSecondary")};
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("medium")};
  padding: 2px 0;
  transition: color 140ms;

  &:hover {
    color: ${cssVarColor("primary")};
  }

  svg {
    font-size: 18px;
  }
`;

export const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const Title = styled.h1`
  font-size: ${cssVarFontSize("h2")};
  font-weight: ${cssVarFontWeight("bold")};
  color: ${cssVarColor("text")};
  margin: 0;
`;

export const Subtitle = styled.p`
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
  margin: 4px 0 0;
`;

export const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 20px 0;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

export const Kpi = styled.div`
  background: ${cssVarColor("backgroundSection")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("lg")};
  box-shadow: ${cssVarShadow("level1")};
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const KpiTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const KpiLabel = styled.span`
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("medium")};
  color: ${cssVarColor("textSecondary")};
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

export const KpiIcon = styled.div<{ $tone: "primary" | "info" | "success" }>`
  width: 36px;
  height: 36px;
  border-radius: ${cssVarRadius("md")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${(p) => cssVarColor(p.$tone === "success" ? "successSubtle" : p.$tone === "info" ? "infoSubtle" : "primarySubtle")};
  color: ${(p) => cssVarColor(p.$tone === "success" ? "success" : p.$tone === "info" ? "info" : "primary")};

  svg {
    font-size: 20px;
  }
`;

export const KpiValue = styled.div`
  font-size: 28px;
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
  line-height: 1;
`;

export const SavedBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: ${cssVarRadius("md")};
  background: ${cssVarColor("successSubtle")};
  color: ${cssVarColor("successText")};
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("medium")};
  margin-bottom: 16px;

  svg {
    font-size: 20px;
  }
`;

export const ListPanel = styled.div`
  background: ${cssVarColor("backgroundSection")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("lg")};
  box-shadow: ${cssVarShadow("level1")};
  overflow: hidden;
`;

export const ListHead = styled.div`
  display: grid;
  grid-template-columns: 1fr 160px 140px;
  align-items: center;
  gap: 16px;
  height: 44px;
  padding: 0 18px;
  background: ${cssVarColor("surfaceSunken")};
  border-bottom: 1px solid ${cssVarColor("borderSubtle")};
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("textSecondary")};
  text-transform: uppercase;
  letter-spacing: 0.02em;

  > span:not(:first-child) {
    text-align: center;
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr 110px 100px;
  }
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 160px 140px;
  align-items: center;
  gap: 16px;
  padding: 10px 18px;
  min-height: 60px;
  border-bottom: 1px solid ${cssVarColor("borderSubtle")};
  transition: background 140ms;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${cssVarColor("backgroundHover")};
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr 110px 100px;
  }
`;

export const Aluno = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

export const AlunoName = styled.div`
  font-weight: ${cssVarFontWeight("semibold")};
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("text")};
`;

export const NotaInputWrap = styled.div`
  display: flex;
  justify-content: center;

  input {
    width: 96px;
    height: 40px;
    text-align: center;
    font-size: ${cssVarFontSize("body1")};
    font-weight: ${cssVarFontWeight("semibold")};
    color: ${cssVarColor("text")};
    border: 1px solid ${cssVarColor("border")};
    border-radius: ${cssVarRadius("md")};
    background: ${cssVarColor("backgroundSection")};
    outline: none;
    transition: border-color 140ms;

    &::placeholder {
      color: ${cssVarColor("textTertiary")};
      font-weight: ${cssVarFontWeight("regular")};
    }

    &:focus {
      border-color: ${cssVarColor("primary")};
    }
  }
`;

export const Situacao = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
