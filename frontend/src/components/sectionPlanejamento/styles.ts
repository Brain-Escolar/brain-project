"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${cssVarRadius("xl")};
  padding: 24px;
  border: 1px solid ${cssVarColor("borderSubtle")};
  background: ${cssVarColor("backgroundSection")};
  width: 100%;
  ${BrainBoxShadow}
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

export const Title = styled.h3`
  margin: 0;
  font-size: ${cssVarFontSize("h3")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const Subtitle = styled.p`
  margin: 0;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
  line-height: 1.4;
`;

export const EventList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const EventItem = styled.div`
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 10px 0;
`;

export const EventDate = styled.span`
  flex-shrink: 0;
  min-width: 40px;
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("medium")};
  color: ${cssVarColor("textSecondary")};
  font-variant-numeric: tabular-nums;
`;

export const EventTitle = styled.span`
  flex: 1;
  min-width: 0;
  font-size: ${cssVarFontSize("body1")};
  color: ${cssVarColor("text")};
  line-height: 1.4;
`;

export const EventTag = styled.span`
  flex-shrink: 0;
  white-space: nowrap;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
`;

export const EmptyState = styled.div`
  padding: 12px 0;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
`;

export const ViewMoreButton = styled.button`
  align-self: flex-start;
  margin-top: 12px;
  background: none;
  border: none;
  padding: 4px 0;
  cursor: pointer;
  color: ${cssVarColor("primary")};
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("semibold")};
  letter-spacing: 0.02em;

  &:hover {
    text-decoration: underline;
  }
`;
