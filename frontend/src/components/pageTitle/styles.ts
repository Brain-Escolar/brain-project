"use client";
import { cssVarColor } from "@/styles";
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 0 1rem 0;
`;
export const AreaTitle = styled.div`
  font-size: 1.8rem;
  line-height: 1.2em;
  font-weight: bold;
  color: ${cssVarColor("text")};
`;
export const AreaDescription = styled.div`
  font-size: 1rem;
  color: ${cssVarColor("textSecondary")};
`;
