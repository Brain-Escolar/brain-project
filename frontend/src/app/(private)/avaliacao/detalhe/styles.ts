"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius, cssVarShadow } from "@/styles";
import styled from "styled-components";

export const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0 24px;
  width: 100%;
`;

export const BackLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  background: none;
  border: none;
  cursor: pointer;
  color: ${cssVarColor("textSecondary")};
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("medium")};
  padding: 2px 0;
  transition: color 140ms;

  &:hover {
    color: ${cssVarColor("primary")};
  }

  svg {
    font-size: 18px;
  }
`;

export const TitleRow = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h1`
  font-size: ${cssVarFontSize("h2")};
  font-weight: ${cssVarFontWeight("bold")};
  color: ${cssVarColor("text")};
  margin: 0;
`;

export const Subtitle = styled.p`
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
  margin: 4px 0 0;
`;

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 380px) 1fr;
  gap: 24px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const Panel = styled.div`
  background: ${cssVarColor("backgroundSection")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("lg")};
  box-shadow: ${cssVarShadow("level1")};
  padding: 20px;
`;

export const EditPanel = styled(Panel)`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const FormRow = styled.div`
  display: flex;
  gap: 12px;

  > * {
    flex: 1;
    min-width: 0;
  }
`;

export const EditActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 4px;
`;

export const SavedIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("success")};

  svg {
    font-size: 17px;
  }
`;

export const PanelTitle = styled.div`
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("textSecondary")};
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin-bottom: 14px;
`;

export const TurmasList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const TurmaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("md")};
  background: ${cssVarColor("backgroundSection")};
  cursor: pointer;
  transition: border-color 140ms, background 140ms;

  &:hover {
    background: ${cssVarColor("backgroundHover")};
    border-color: ${cssVarColor("border")};
  }
`;

export const TurmaMain = styled.div`
  flex: 1;
  min-width: 0;
`;

export const TurmaName = styled.div`
  font-size: ${cssVarFontSize("body1")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const TurmaSub = styled.div`
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textTertiary")};
  margin-top: 2px;
`;

export const TurmaRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

export const TurmaDatesEditor = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("md")};
  background: ${cssVarColor("surfaceSunken")};
`;

export const AddTurmaRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 16px;
`;
