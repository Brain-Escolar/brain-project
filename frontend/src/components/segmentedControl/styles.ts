"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius, cssVarShadow } from "@/styles";
import styled from "styled-components";

export const Group = styled.div`
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  background: ${cssVarColor("surfaceSunken")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("md")};
`;

export const Segment = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  cursor: pointer;
  padding: 7px 18px;
  border-radius: ${cssVarRadius("sm")};
  font-family: inherit;
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${({ $active }) =>
    $active ? cssVarFontWeight("semibold") : cssVarFontWeight("medium")};
  color: ${({ $active }) => ($active ? cssVarColor("primary") : cssVarColor("textSecondary"))};
  background: ${({ $active }) => ($active ? cssVarColor("backgroundSection") : "transparent")};
  box-shadow: ${({ $active }) => ($active ? cssVarShadow("level1") : "none")};
  transition:
    background 0.14s ease,
    color 0.14s ease,
    box-shadow 0.14s ease;

  &:hover {
    color: ${cssVarColor("text")};
  }
`;
