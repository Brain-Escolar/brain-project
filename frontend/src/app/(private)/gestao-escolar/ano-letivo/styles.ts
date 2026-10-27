"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled, { css } from "styled-components";
import { StatusAnoLetivo } from "@/services/domains/ano-letivo";

const cartao = css`
  border-radius: ${cssVarRadius("xl")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  background: ${cssVarColor("backgroundSection")};
  ${BrainBoxShadow}
`;

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
  gap: 20px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const ListaAnos = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const CartaoAno = styled.button<{ $selecionado: boolean }>`
  all: unset;
  box-sizing: border-box;
  ${cartao}
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  cursor: pointer;
  border-color: ${({ $selecionado }) =>
    $selecionado ? cssVarColor("primary") : cssVarColor("borderSubtle")};
  outline-offset: 2px;

  &:focus-visible {
    outline: 2px solid ${cssVarColor("primary")};
  }
`;

export const CartaoAnoTopo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const AnoNumero = styled.span`
  font-size: ${cssVarFontSize("h3")};
  font-weight: ${cssVarFontWeight("bold")};
  color: ${cssVarColor("text")};
`;

export const Suave = styled.span`
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
`;

const corStatus: Record<StatusAnoLetivo, { bg: string; fg: string }> = {
  ABERTO: { bg: cssVarColor("successSubtle"), fg: cssVarColor("successText") },
  PLANEJAMENTO: { bg: cssVarColor("infoSubtle"), fg: cssVarColor("infoText") },
  ENCERRADO: { bg: cssVarColor("surfaceSunken"), fg: cssVarColor("textSecondary") },
};

export const Status = styled.span<{ $status: StatusAnoLetivo }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: ${cssVarRadius("pill")};
  font-size: 12px;
  font-weight: ${cssVarFontWeight("semibold")};
  background: ${({ $status }) => corStatus[$status].bg};
  color: ${({ $status }) => corStatus[$status].fg};
`;

export const Painel = styled.section`
  ${cartao}
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px;
  min-width: 0;
`;

export const PainelTopo = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const Titulo = styled.h2`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: ${cssVarFontSize("h4")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const Aviso = styled.p`
  margin: 0;
  padding: 10px 14px;
  border-radius: ${cssVarRadius("md")};
  background: ${cssVarColor("surfaceSunken")};
  color: ${cssVarColor("textSecondary")};
  font-size: ${cssVarFontSize("body2")};
`;

export const Periodos = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const LinhaPeriodo = styled.div`
  display: grid;
  grid-template-columns: 32px minmax(140px, 1fr) 170px 170px 40px;
  gap: 10px;
  align-items: center;

  @media (max-width: 700px) {
    grid-template-columns: 32px minmax(0, 1fr) 40px;
    & > .data {
      grid-column: 2 / 3;
    }
  }
`;

export const Sequencia = styled.span`
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("textTertiary")};
  text-align: center;
`;

export const Acoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
`;

export const Vazio = styled.div`
  ${cartao}
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 40px 20px;
  color: ${cssVarColor("textSecondary")};
  text-align: center;
`;
