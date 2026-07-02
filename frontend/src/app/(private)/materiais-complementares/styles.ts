"use client";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius, cssVarShadow } from "@/styles";
import styled from "styled-components";

export const DiscSection = styled.section`
  background: ${cssVarColor("backgroundSection")};
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("xl")};
  box-shadow: ${cssVarShadow("level1")};
  padding: 16px;
  margin-bottom: 16px;
`;

export const DiscHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`;

export const DiscTitleWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const DiscIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${cssVarRadius("md")};
  background: ${cssVarColor("primarySubtle")};
  color: ${cssVarColor("primary")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    font-size: 20px;
  }
`;

export const DiscName = styled.div`
  font-size: ${cssVarFontSize("h4")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
`;

export const DiscCount = styled.div`
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textSecondary")};
`;

export const AddBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid ${cssVarColor("border")};
  border-radius: ${cssVarRadius("md")};
  background: transparent;
  color: ${cssVarColor("text")};
  font-size: ${cssVarFontSize("small")};
  font-weight: ${cssVarFontWeight("medium")};
  cursor: pointer;
  transition: background 140ms;

  &:hover {
    background: ${cssVarColor("backgroundHover")};
  }

  svg {
    font-size: 18px;
  }
`;

export const EmptyDisc = styled.div`
  padding: 20px;
  text-align: center;
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textTertiary")};
  border: 1px dashed ${cssVarColor("border")};
  border-radius: ${cssVarRadius("lg")};
`;

export const MatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;

  @media (max-width: 340px) {
    grid-template-columns: 1fr;
  }
`;

export const MatCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("xl")};
  background: ${cssVarColor("backgroundSection")};
  box-shadow: ${cssVarShadow("level1")};
  transition: box-shadow 140ms, border-color 140ms;

  &:hover {
    box-shadow: ${cssVarShadow("level2")};
    border-color: ${cssVarColor("border")};
  }
`;

export const MatCardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`;

export const MatCardIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${cssVarRadius("md")};
  background: ${cssVarColor("primarySubtle")};
  color: ${cssVarColor("primary")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    font-size: 21px;
  }
`;

export const MatCardTitle = styled.div`
  font-size: ${cssVarFontSize("h4")};
  font-weight: ${cssVarFontWeight("semibold")};
  color: ${cssVarColor("text")};
  line-height: 1.3;
`;

export const MatCardDesc = styled.div`
  font-size: ${cssVarFontSize("body2")};
  color: ${cssVarColor("textSecondary")};
  line-height: 1.45;
`;

export const MatCardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: ${cssVarFontSize("small")};
  color: ${cssVarColor("textTertiary")};
  flex-wrap: wrap;
`;

export const MatCardFoot = styled.div`
  border-top: 1px solid ${cssVarColor("borderSubtle")};
  padding-top: 12px;
  margin-top: 2px;
`;

export const MatCardOpen = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: ${cssVarFontSize("body2")};
  font-weight: ${cssVarFontWeight("medium")};
  color: ${cssVarColor("primary")};
  text-decoration: none;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;

  svg {
    font-size: 18px;
  }

  &:hover {
    text-decoration: underline;
  }
`;
