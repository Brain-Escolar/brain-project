"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled from "styled-components";

export const Card = styled.button`
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  text-align: left;
  background: ${cssVarColor("background")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("xl")};
  padding: 20px;
  cursor: pointer;
  font-family: inherit;
  transition: box-shadow 0.14s ease, border-color 0.14s ease, background 0.14s ease;
  ${BrainBoxShadow}

  &:hover {
    border-color: ${cssVarColor("border")};
    background: ${cssVarColor("backgroundHover")};
  }
`;

export const Top = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const Title = styled.div`
  font-size: ${cssVarFontSize("h4")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
  line-height: 1.2;
`;

export const Subtitle = styled.div`
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textTertiary")};
  margin-top: 4px;
`;

export const Stats = styled.div`
  display: flex;
  gap: 28px;
`;

export const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const StatValue = styled.span`
  font-size: ${cssVarFontSize("h4")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
  font-variant-numeric: tabular-nums;
  line-height: 1;
`;

export const StatLabel = styled.span`
  font-size: 10px;
  color: ${cssVarColor("textTertiary")};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;
