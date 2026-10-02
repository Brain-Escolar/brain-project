"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled from "styled-components";

export const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const SecaoHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;

export const SecaoTitulo = styled.h2`
  margin: 0;
  font-size: ${cssVarFontSize("h4")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const SecaoMeta = styled.span`
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textTertiary")};
`;

export const ListaAulas = styled.div`
  overflow: hidden;
  border: 1px solid ${cssVarColor("border")};
  border-radius: ${cssVarRadius("lg")};
  background: ${cssVarColor("backgroundSection")};
  ${BrainBoxShadow}
`;

export const LinhaAula = styled.div<{ $agora: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 15px 20px;

  & + & {
    border-top: 1px solid ${cssVarColor("borderSubtle")};
  }

  ${(p) =>
    p.$agora &&
    `
    background: ${cssVarColor("primarySubtle")};
    box-shadow: inset 3px 0 0 ${cssVarColor("primary")};
  `}
`;

export const Horario = styled.div`
  width: 108px;
  flex-shrink: 0;
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("textSecondary")};
  font-variant-numeric: tabular-nums;
`;

export const AulaCorpo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const AulaTopo = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
`;

export const TagDisciplina = styled.span`
  padding: 3px 9px;
  border-radius: ${cssVarRadius("pill")};
  background: ${cssVarColor("surfaceSunken")};
  color: ${cssVarColor("textSecondary")};
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("semibold")};
`;

export const Professor = styled.span`
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
`;

export const Sala = styled.div`
  margin-top: 5px;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textTertiary")};
`;

export const SidebarStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

export const PanelCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  padding: 20px;
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("xl")};
  background: ${cssVarColor("backgroundSection")};
  ${BrainBoxShadow}
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const PanelTitle = styled.h3`
  margin: 0;
  font-size: ${cssVarFontSize("body1")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const CountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: ${cssVarRadius("pill")};
  background: ${cssVarColor("primarySubtle")};
  color: ${cssVarColor("primary")};
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("bold")};
  line-height: 1;
`;

export const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const TarefaCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("md")};
`;

export const CardTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const CardPrazo = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("medium")};
  color: ${cssVarColor("textSecondary")};

  svg {
    font-size: 14px;
  }
`;

export const CardTitle = styled.div`
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("medium")};
  line-height: 1.35;
  color: ${cssVarColor("text")};
`;

export const OcorrenciaRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

export const OcorrenciaIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: ${cssVarRadius("pill")};
  background: ${cssVarColor("warningSubtle")};
  color: ${cssVarColor("warningText")};

  svg {
    font-size: 18px;
  }
`;

export const OcorrenciaTitulo = styled.div`
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("medium")};
  line-height: 1.35;
  color: ${cssVarColor("text")};
`;

export const OcorrenciaMeta = styled.div`
  margin-top: 2px;
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textTertiary")};
`;

export const EmptyHint = styled.p`
  margin: 0;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textTertiary")};
`;
