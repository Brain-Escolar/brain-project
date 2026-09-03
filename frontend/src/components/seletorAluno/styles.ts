"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import styled from "styled-components";

export const Wrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

export const Trigger = styled.button`
  height: 40px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 4px 12px 4px 6px;
  border-radius: ${cssVarRadius("pill")};
  background: ${cssVarColor("primarySubtle")};
  border: 1px solid ${cssVarColor("primarySubtleHover")};
  cursor: pointer;
  font-family: inherit;
  color: ${cssVarColor("primary")};
  transition: background 140ms ease;

  &:hover {
    background: ${cssVarColor("primarySubtleHover")};
  }
`;

export const TriggerNome = styled.span`
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("semibold")};
  white-space: nowrap;
`;

/** Nome em texto simples, usado quando ha um unico aluno vinculado. */
export const NomeEstatico = styled.span`
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
  white-space: nowrap;
`;

export const Dropdown = styled.div`
  position: absolute;
  top: 48px;
  right: 0;
  width: 280px;
  padding: 6px;
  z-index: 40;
  background: ${cssVarColor("backgroundSection")};
  border: 1px solid ${cssVarColor("border")};
  border-radius: ${cssVarRadius("lg")};
  box-shadow: ${({ theme }) => theme.shadows.level3};
`;

export const Opcao = styled.button<{ $ativo: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: ${cssVarRadius("md")};
  background: ${(p) => (p.$ativo ? cssVarColor("primarySubtle") : "transparent")};
  cursor: pointer;
  font-family: inherit;
  text-align: left;

  &:hover {
    background: ${cssVarColor("backgroundHover")};
  }
`;

export const OpcaoTexto = styled.div`
  flex: 1;
  min-width: 0;
`;

export const OpcaoNome = styled.div`
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const OpcaoMeta = styled.div`
  margin-top: 1px;
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textSecondary")};
`;
