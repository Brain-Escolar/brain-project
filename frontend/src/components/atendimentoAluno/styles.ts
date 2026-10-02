"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import styled from "styled-components";

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

export const Linha = styled.li`
  display: flex;
  gap: 14px;
  padding: 14px 16px;
  border-radius: ${cssVarRadius("lg")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  background: ${cssVarColor("background")};
`;

export const Lista = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
  width: 100%;
`;

export const Data = styled.time`
  flex-shrink: 0;
  width: 84px;
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("primary")};
`;

export const Corpo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1;
`;

export const Profissional = styled.span`
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textSecondary")};
`;

export const Descricao = styled.p`
  margin: 0;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("text")};
  white-space: pre-wrap;
`;

export const Vazio = styled.p`
  margin: 0;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textTertiary")};
`;

export const LaudoBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: ${cssVarRadius("md")};
  border: 1px dashed ${cssVarColor("borderSubtle")};
  background: ${cssVarColor("backgroundSection")};
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
`;
