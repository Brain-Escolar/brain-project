"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled from "styled-components";

export const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 22px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const SecaoTitulo = styled.h2`
  margin: 28px 0 12px;
  font-size: ${cssVarFontSize("h4")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Produto = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  border: 1px solid ${cssVarColor("border")};
  border-radius: ${cssVarRadius("lg")};
  background: ${cssVarColor("backgroundSection")};
  ${BrainBoxShadow}

  @media (max-width: 640px) {
    flex-wrap: wrap;
  }
`;

export const ProdutoIcone = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: ${cssVarRadius("sm")};
  background: ${cssVarColor("primarySubtle")};
  color: ${cssVarColor("primary")};
`;

export const ProdutoCorpo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ProdutoNome = styled.div`
  font-size: ${cssVarFontSize("body1")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const ProdutoModalidade = styled.div`
  margin-top: 3px;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
`;

export const ProdutoData = styled.div`
  margin-top: 3px;
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textTertiary")};
`;

export const ProdutoDireita = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const Valor = styled.span<{ $cancelado: boolean }>`
  white-space: nowrap;
  font-size: ${cssVarFontSize("h4")};
  font-weight: ${cssVarFontWeight("bold")};
  font-variant-numeric: tabular-nums;
  color: ${(p) => (p.$cancelado ? cssVarColor("textTertiary") : cssVarColor("text"))};
  text-decoration: ${(p) => (p.$cancelado ? "line-through" : "none")};
`;

export const ValorOriginal = styled.span`
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textTertiary")};
  text-decoration: line-through;
  font-variant-numeric: tabular-nums;
`;

/** Bloco de módulo futuro — sem ação, apenas sinaliza o que vem depois. */
export const Placeholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 200px;
  margin-top: 24px;
  padding: 28px 20px;
  text-align: center;
  border: 2px dashed ${cssVarColor("border")};
  border-radius: ${cssVarRadius("lg")};
  background: ${cssVarColor("background")};
`;

export const PlaceholderTitulo = styled.div`
  font-size: ${cssVarFontSize("h4")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("textSecondary")};
`;

export const PlaceholderTexto = styled.div`
  max-width: 420px;
  font-size: ${cssVarFontSize("body2")};
  line-height: 1.5;
  color: ${cssVarColor("textTertiary")};
`;
