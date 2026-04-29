"use client";
import { cssVarColor } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled from "styled-components";

export const ResumoContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  padding: 20px 16px;
  border: 1px solid ${cssVarColor("border")};
  min-height: 534px;
  width: 100%;
  gap: 24px;
  ${BrainBoxShadow}
`;

export const ResumoHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ResumoTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: ${cssVarColor("text")};
`;

export const ResumoSubtitle = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${cssVarColor("textSecondary")};
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const SectionTitle = styled.h4`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${cssVarColor("text")};
`;

export const CountBadge = styled.span`
  background: ${cssVarColor("primary")};
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 500;
`;

export const Card = styled.div`
  padding: 12px;
  border: 1px solid ${cssVarColor("border")};
  border-radius: 8px;
  background: ${cssVarColor("background")};
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${cssVarColor("primary")};
  }
`;

export const CardTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

export const CardTitle = styled.span`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${cssVarColor("text")};
`;

export const CardBadge = styled.span`
  background: ${cssVarColor("backgroundHover")};
  color: ${cssVarColor("textSecondary")};
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
`;

export const CardMeta = styled.span`
  font-size: 0.75rem;
  color: ${cssVarColor("textSecondary")};
`;

export const CardDescription = styled.p`
  margin: 0;
  font-size: 0.75rem;
  color: ${cssVarColor("textSecondary")};
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const CardDeadline = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: ${cssVarColor("textSecondary")};
`;
