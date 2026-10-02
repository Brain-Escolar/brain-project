"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import styled from "styled-components";

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

export const CampoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  width: 100%;

  @media (max-width: 720px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const ItemList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
  width: 100%;
`;

export const ItemRow = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: ${cssVarRadius("lg")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  background: ${cssVarColor("background")};
`;

export const ItemBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

export const ItemTitulo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const ItemMeta = styled.span`
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textSecondary")};
`;

export const ItemObservacao = styled.p`
  margin: 2px 0 0;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
  white-space: pre-wrap;
`;

export const ItemAcoes = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

export const Vazio = styled.p`
  margin: 0;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textTertiary")};
`;
