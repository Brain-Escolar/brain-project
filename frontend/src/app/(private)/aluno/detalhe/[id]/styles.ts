"use client";
import { cssVarColor, cssVarRadius, cssVarShadow } from "@/styles";
import styled from "styled-components";

export const PageStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

/* ─── Cabeçalho do perfil ─── */
export const ProfileHeaderCard = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  background-color: ${cssVarColor("backgroundSection")};
  border-radius: ${cssVarRadius("lg")};
  box-shadow: ${cssVarShadow("level1")};
  padding: 24px;
`;

export const ProfileHeaderInfo = styled.div`
  flex: 1;
  min-width: 220px;

  .nome-linha {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    .nome {
      font-size: 1.3rem;
      font-weight: 700;
      color: ${cssVarColor("text")};
    }
  }
`;

export const ProfileMetaRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 8px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.85rem;
    color: ${cssVarColor("textSecondary")};

    svg {
      font-size: 16px;
      color: ${cssVarColor("textTertiary")};
    }
  }

  .mono {
    font-family: monospace;
  }
`;

interface IInitialsAvatarProps {
  $large?: boolean;
}

export const InitialsAvatar = styled.div<IInitialsAvatarProps>`
  width: ${(p) => (p.$large ? "64px" : "36px")};
  height: ${(p) => (p.$large ? "64px" : "36px")};
  border-radius: 50%;
  background-color: ${cssVarColor("primarySubtle")};
  color: ${cssVarColor("primary")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 600;
  font-size: ${(p) => (p.$large ? "1.1rem" : "0.75rem")};

  svg {
    width: ${(p) => (p.$large ? "34px" : "20px")};
    height: ${(p) => (p.$large ? "34px" : "20px")};
  }
`;

/* ─── Layout de 2 colunas (aba Visão geral) ─── */
export const TwoColumnGrid = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;
  flex-wrap: wrap;

  .col {
    flex: 1;
    min-width: 320px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
`;

/* ─── Field grid (Dados cadastrais) ─── */
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

/* ─── Responsáveis ─── */
export const ResponsavelList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const ResponsavelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid ${cssVarColor("borderSubtle")};
  border-radius: ${cssVarRadius("sm")};

  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;

    .nome {
      font-size: 0.875rem;
      font-weight: 600;
      color: ${cssVarColor("text")};
    }

    .tel {
      font-size: 0.75rem;
      color: ${cssVarColor("textTertiary")};
      margin-top: 1px;
    }
  }
`;

/* ─── Ocorrências ─── */
export const OcorrenciaList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const OcorrenciaRow = styled.div`
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px dashed ${cssVarColor("borderSubtle")};

  &:last-child {
    border-bottom: none;
  }

  .data {
    font-family: monospace;
    font-size: 0.7rem;
    color: ${cssVarColor("textTertiary")};
    white-space: nowrap;
    min-width: 46px;
    padding-top: 2px;
  }

  .corpo {
    min-width: 0;

    .tipo {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: ${cssVarColor("textSecondary")};
    }

    p {
      font-size: 0.875rem;
      color: ${cssVarColor("textSecondary")};
      line-height: 1.45;
      margin-top: 2px;
    }
  }
`;

/* ─── Boletim resumo ─── */
export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  .value {
    font-family: monospace;
    font-size: 1.7rem;
    font-weight: 600;
    color: ${cssVarColor("text")};
  }

  .label {
    font-size: 0.7rem;
    color: ${cssVarColor("textTertiary")};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

/* ─── Estado vazio ─── */
export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 48px 24px;
  text-align: center;
  background-color: ${cssVarColor("backgroundSection")};
  border-radius: ${cssVarRadius("lg")};
  box-shadow: ${cssVarShadow("level1")};

  svg {
    color: ${cssVarColor("textTertiary")};
  }
`;
