"use client";
import { cssVarColor } from "@/styles";
import { BrainBoxShadow } from "@/utils/utilsCss";
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  padding: 20px 16px;
  border: 1px solid ${cssVarColor("border")};
  min-height: 534px;
  width: 100%;
  ${BrainBoxShadow}
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: white;
  font-weight: bold;
  font-size: 14px;
`;

export const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: ${cssVarColor("text")};
`;

export const Subtitle = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${cssVarColor("textSecondary")};
`;

export const TasksSection = styled.div`
  margin-bottom: 24px;
  max-height: 400px;
  overflow-y: auto;
`;

export const SectionTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${cssVarColor("text")};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const TaskCount = styled.span`
  background: ${cssVarColor("primary")};
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 500;
`;

export const TaskItem = styled.div`
  padding: 12px;
  border: 1px solid ${cssVarColor("border")};
  border-radius: 8px;
  margin-bottom: 8px;
  background: ${cssVarColor("background")};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${cssVarColor("primary")};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

export const TaskTitle = styled.div`
  font-weight: 600;
  color: ${cssVarColor("text")};
  margin-bottom: 4px;
  font-size: 0.875rem;
`;

export const TaskMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: ${cssVarColor("textSecondary")};
`;

export const TaskSubject = styled.span`
  background: ${cssVarColor("backgroundHover")};
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
`;

export const TaskDescription = styled.p`
  margin: 8px 0 0 0;
  font-size: 0.75rem;
  color: ${cssVarColor("textSecondary")};
  line-height: 1.4;
`;

export const ViewMoreButton = styled.button`
  background: none;
  border: none;
  color: ${cssVarColor("primary")};
  font-size: 0.875rem;
  cursor: pointer;
  padding: 8px 0;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const EvaluationsSection = styled.div`
  margin-top: auto;
`;

export const EvaluationItem = styled.div`
  padding: 10px 12px;
  border: 1px solid ${cssVarColor("border")};
  border-radius: 6px;
  margin-bottom: 8px;
  background: ${cssVarColor("background")};
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const EvaluationIcon = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${cssVarColor("primary")};
  flex-shrink: 0;
`;

export const EvaluationContent = styled.div`
  flex: 1;
`;

export const EvaluationTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${cssVarColor("text")};
`;

export const EvaluationMeta = styled.div`
  font-size: 0.75rem;
  color: ${cssVarColor("textSecondary")};
  margin-top: 2px;
`;

export const EvaluationDate = styled.div`
  font-size: 0.75rem;
  color: ${cssVarColor("textSecondary")};
  white-space: nowrap;
`;
