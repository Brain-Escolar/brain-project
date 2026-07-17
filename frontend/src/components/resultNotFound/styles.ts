import { cssVarColor, cssVarFontSize, cssVarFontWeight } from "@/styles";
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 40px 24px;
  text-align: center;

  svg {
    font-size: 34px;
    color: ${cssVarColor("textTertiary")};
  }
`;

export const TitleResultNotFound = styled.h2`
  font-size: ${cssVarFontSize("body1")};
  font-weight: ${cssVarFontWeight("semibold")};
  margin: 10px 0 0;
  color: ${cssVarColor("text")};
`;

export const DescriptionResultNotFound = styled.p`
  font-size: ${cssVarFontSize("body2")};
  margin: 6px 0 0;
  max-width: 360px;
  color: ${cssVarColor("textSecondary")};
  line-height: 1.5;
`;
