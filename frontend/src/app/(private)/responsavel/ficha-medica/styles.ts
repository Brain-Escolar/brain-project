"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled from "styled-components";

export const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const SecaoTitulo = styled.h2`
  margin: 28px 0 12px;
  font-size: ${cssVarFontSize("h3")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const SecaoTopo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin: 28px 0 12px;

  h2 {
    margin: 0;
  }
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div`
  padding: 16px 18px;
  border: 1px solid ${cssVarColor("border")};
  border-radius: ${cssVarRadius("md")};
  background: ${cssVarColor("backgroundSection")};
  ${BrainBoxShadow}
`;

export const CardTopo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: ${cssVarColor("textTertiary")};

  svg {
    font-size: 18px;
  }
`;

export const CardRotulo = styled.span`
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("semibold")};
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;

export const CardValor = styled.p`
  margin: 0;
  font-size: ${cssVarFontSize("body1")};
  line-height: 1.5;
  color: ${cssVarColor("text")};
  white-space: pre-line;
`;

/** Usado quando o campo veio vazio do backend — nunca inventa conteudo. */
export const CardVazio = styled.p`
  margin: 0;
  font-size: ${cssVarFontSize("body2")};
  font-style: italic;
  color: ${cssVarColor("textTertiary")};
`;

export const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Linha = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid ${cssVarColor("border")};
  border-radius: ${cssVarRadius("md")};
  background: ${cssVarColor("backgroundSection")};
  ${BrainBoxShadow}

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const LinhaNome = styled.p`
  margin: 0;
  font-size: ${cssVarFontSize("body1")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const LinhaMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 6px;
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textTertiary")};
`;

export const LinhaObs = styled.p`
  margin: 8px 0 0;
  font-size: ${cssVarFontSize("body2")};
  line-height: 1.45;
  color: ${cssVarColor("textSecondary")};
`;

export const LinkArquivo = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  align-self: center;
  padding: 8px 14px;
  border-radius: ${cssVarRadius("pill")};
  border: 1px solid ${cssVarColor("border")};
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("primary")};
  text-decoration: none;

  &:hover {
    background: ${cssVarColor("primarySubtle")};
  }

  svg {
    font-size: 18px;
  }
`;

/**
 * Aviso de que a tela e de leitura, com duas excecoes. Sem ele o responsavel
 * fica procurando onde edita o tipo sanguineo que a escola cadastrou.
 */
export const Nota = styled.p`
  margin: 24px 0 0;
  padding: 12px 14px;
  border-left: 3px solid ${cssVarColor("border")};
  font-size: ${cssVarFontSize("body2")};
  line-height: 1.5;
  color: ${cssVarColor("textSecondary")};
`;
