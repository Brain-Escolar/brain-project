"use client";
import { cssVarColor, cssVarFontSize } from "@/styles";
import styled from "styled-components";

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

export const OpcaoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2px 16px;
  width: 100%;

  @media (max-width: 720px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Contador = styled.span`
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
`;

export const Vazio = styled.p`
  margin: 0;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textTertiary")};
`;
