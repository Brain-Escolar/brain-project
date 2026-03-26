"use client";
import { cssVarColor } from "@/styles";
import styled from "styled-components";

export const Container = styled.div`
  background-color: ${cssVarColor("backgroundSection")};
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

export const HeaderContainer = styled.div`
  margin: 0 0 20px 0;

  h2 {
    color: ${cssVarColor("text")};
  }

  p {
    font-size: 0.9rem;
    color: ${cssVarColor("textSecondary")};
  }
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
