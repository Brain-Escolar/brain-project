import { cssVarColor } from "@/styles";
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export const TitleResultNotFound = styled.h2`
  font-size: 0.8rem;
  margin-top: 8px;
  color: ${cssVarColor("textSecondary")};
`;
