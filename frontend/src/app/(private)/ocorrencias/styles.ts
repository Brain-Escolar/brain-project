"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled from "styled-components";

export const Filtros = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 22px;
`;

export const Chip = styled.button<{ $ativo: boolean }>`
  padding: 7px 14px;
  border-radius: ${cssVarRadius("pill")};
  font-size: ${cssVarFontSize("body2")};
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  background: ${(p) => (p.$ativo ? cssVarColor("primary") : cssVarColor("backgroundSection"))};
  color: ${(p) => (p.$ativo ? "#fff" : cssVarColor("textSecondary"))};
  border: 1px solid ${(p) => (p.$ativo ? cssVarColor("primary") : cssVarColor("border"))};
  font-weight: ${(p) => (p.$ativo ? cssVarFontWeight("semibold") : cssVarFontWeight("regular"))};
`;

export const ContagemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const Grupo = styled.div`
  margin-top: 24px;
`;

export const GrupoDia = styled.div`
  margin-bottom: 10px;
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("textTertiary")};
`;

export const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-left: 24px;
  border-left: 2px solid ${cssVarColor("border")};
`;

export const Item = styled.div`
  position: relative;
  padding: 14px 16px;
  border: 1px solid ${cssVarColor("border")};
  border-radius: ${cssVarRadius("md")};
  background: ${cssVarColor("backgroundSection")};
  ${BrainBoxShadow}
`;

export const Marcador = styled.span<{ $cor: string }>`
  position: absolute;
  left: -31px;
  top: 19px;
  width: 12px;
  height: 12px;
  border-radius: ${cssVarRadius("pill")};
  background: ${(p) => p.$cor};
  box-shadow: 0 0 0 3px ${cssVarColor("background")};
`;

export const ItemTopo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

export const ItemMeta = styled.span`
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textTertiary")};
`;

export const ItemDesc = styled.p`
  margin: 8px 0 0;
  font-size: ${cssVarFontSize("body2")};
  line-height: 1.45;
  color: ${cssVarColor("textSecondary")};
`;
