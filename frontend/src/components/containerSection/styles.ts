"use client";
import { cssVarColor, cssVarRadius, cssVarShadow, cssVarFontSize } from "@/styles";
import styled from "styled-components";

export const Container = styled.div`
  background-color: ${cssVarColor("backgroundSection")};
  padding: 20px;
  border-radius: ${cssVarRadius("md")};
  box-shadow: ${cssVarShadow("level1")};
  margin-bottom: 20px;
`;

export const HeaderContainer = styled.div`
  margin: 0 0 20px 0;

  h2 {
    color: ${cssVarColor("text")};
  }

  p {
    font-size: ${cssVarFontSize("body2")};
    color: ${cssVarColor("textSecondary")};
  }
`;

export const HeaderTitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const HeaderActions = styled.div`
  flex-shrink: 0;
`;

interface IBodyContainerProps {
  $numberOfCollumns: number;
}

export const BodyContainer = styled.div<IBodyContainerProps>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.$numberOfCollumns}, 1fr);
  grid-gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;
