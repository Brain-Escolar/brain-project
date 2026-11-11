"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled from "styled-components";

/**
 * auto-fit em vez de três colunas fixas: o carnê tem quatro números que a
 * família pergunta — quanto falta, quanto já pagou, quanto está atrasado e
 * quanto a bolsa abateu — e nenhum deles pode cair fora da primeira tela.
 */
export const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 22px;

  @media (max-width: 640px) {
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

  /*
    No celular o valor e a situacao descem para uma linha propria.

    O container ja tinha flex-wrap, mas nada chegava a quebrar: com o corpo
    em flex:1 e min-width:0, quem cedia espaco era sempre o texto. O nome do
    produto cabia, e a linha de baixo saia picada -- "Parcela 1/12 · Daniel
    Moraes (demo) · CT-2026-2" em cinco linhas de duas palavras, numa coluna
    de ~100px, enquanto o valor ficava inteiro do lado.

    Com flex-basis 100% este bloco nao cabe ao lado do corpo e desce, que e
    a ordem de leitura certa: do que e a cobranca, depois quanto e.
  */
  @media (max-width: 640px) {
    flex-basis: 100%;
    justify-content: space-between;
    margin-top: 12px;
  }
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
