"use client";
import { cssVarColor } from "@/styles";
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px;
  border-radius: 8px;
`;

export const DateText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${cssVarColor("text")};
  min-width: 200px;
  text-align: center;
`;
