"use client";
import { cssVarColor } from "@/styles";
import styled from "styled-components";

export const PageLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

/* ─── Sidebar ─── */
export const SidebarCard = styled.div`
  position: sticky;
  top: 24px;
  background-color: ${cssVarColor("backgroundSection")};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

export const SidebarHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 20px 16px;
  gap: 12px;
  border-bottom: 1px solid ${cssVarColor("border")};
`;

export const AvatarWrapper = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: ${cssVarColor("border")};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  svg {
    width: 40px;
    height: 40px;
    color: ${cssVarColor("textSecondary")};
  }
`;

export const SidebarProfileInfo = styled.div`
  text-align: center;

  .nome {
    font-size: 0.95rem;
    font-weight: 600;
    color: ${cssVarColor("text")};
    margin-bottom: 2px;
  }

  .matricula {
    font-size: 0.8rem;
    color: ${cssVarColor("textSecondary")};
  }
`;

export const SidebarItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid ${cssVarColor("border")};

  &:last-child {
    border-bottom: none;
  }

  .label {
    font-size: 0.8rem;
    color: ${cssVarColor("textSecondary")};
  }

  .value {
    font-size: 0.8rem;
    font-weight: 600;
    color: ${cssVarColor("text")};
    text-align: right;
    max-width: 160px;
    word-break: break-word;
  }
`;

/* ─── Field grid (tab content) ─── */
export const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;

export const FieldItem = styled.div`
  .field-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${cssVarColor("textSecondary")};
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 4px;
  }

  .field-value {
    font-size: 0.875rem;
    color: ${cssVarColor("text")};
  }
`;
