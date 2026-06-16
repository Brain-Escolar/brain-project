"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight } from "@/styles";
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 0 1rem 0;
`;
export const AreaTitle = styled.div`
  font-size: ${cssVarFontSize("h1")};
  line-height: 1.2em;
  font-weight: ${cssVarFontWeight("bold")};
  color: ${cssVarColor("text")};
`;
export const AreaDescription = styled.div`
  font-size: ${cssVarFontSize("body1")};
  color: ${cssVarColor("textSecondary")};
`;
