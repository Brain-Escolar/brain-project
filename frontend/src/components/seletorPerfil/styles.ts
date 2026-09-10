"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadowHover } from "@/utils/utilsCss";
import styled from "styled-components";

export const Wrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

export const Trigger = styled.button`
  height: 36px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 12px;
  border-radius: ${cssVarRadius("pill")};
  background: transparent;
  border: 1px solid ${cssVarColor("border")};
  cursor: pointer;
  font-family: inherit;
  color: ${cssVarColor("textSecondary")};
  transition: background 140ms ease;

  &:hover {
    background: ${cssVarColor("backgroundHover")};
    color: ${cssVarColor("text")};
  }
`;

export const Rotulo = styled.span`
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("medium")};
  white-space: nowrap;
`;

export const Dropdown = styled.div`
  position: absolute;
  top: 44px;
  right: 0;
  width: 240px;
  padding: 6px;
  z-index: 40;
  background: ${cssVarColor("backgroundSection")};
  border: 1px solid ${cssVarColor("border")};
  border-radius: ${cssVarRadius("lg")};
  ${BrainBoxShadowHover}
`;

export const Titulo = styled.div`
  padding: 8px 10px 6px;
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("textTertiary")};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const Opcao = styled.button<{ $ativo: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: ${cssVarRadius("md")};
  background: ${(p) => (p.$ativo ? cssVarColor("primarySubtle") : "transparent")};
  color: ${(p) => (p.$ativo ? cssVarColor("primary") : cssVarColor("text"))};
  font-family: inherit;
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${(p) => (p.$ativo ? cssVarFontWeight("semibold") : cssVarFontWeight("regular"))};
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${(p) => (p.$ativo ? cssVarColor("primarySubtle") : cssVarColor("backgroundHover"))};
  }

  svg {
    font-size: 18px;
  }
`;
