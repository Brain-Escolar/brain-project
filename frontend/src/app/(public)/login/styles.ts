"use client";
import styled from "styled-components";
import { Box } from "@mui/material";

/**
 * Login — split layout do Design System Brain.
 * Esquerda: painel azul da marca (gradiente + wordmark + mascote Brainy).
 * Direita: formulário sobre superfície branca.
 *
 * Os tokens são acessados via variáveis CSS (geradas em GlobalStyle a partir do
 * tema), pois o app não usa o ThemeProvider do styled-components.
 */
export const LoginWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100vh;
  width: 100%;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

/* Painel da marca (escondido no mobile) */
export const Aside = styled.aside`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 56px;
  color: #fff;
  /* Gradiente azul Brain — blue-700 → blue-600 (marca) → blue-500 */
  background: linear-gradient(150deg, #1a3fa6, #1e4bc8 55%, #4067dc);

  @media (max-width: 900px) {
    display: none;
  }
`;

export const AsideLogo = styled.img`
  height: 30px;
  width: auto;
  align-self: flex-start;
`;

export const Pitch = styled.div`
  position: relative;
  z-index: 1;

  h2 {
    color: #fff;
    font-size: 34px;
    font-weight: var(--fontWeights-bold);
    letter-spacing: -0.02em;
    line-height: 1.15;
    max-width: 420px;
  }

  p {
    color: rgba(255, 255, 255, 0.78);
    font-size: var(--fontSizes-body1);
    margin-top: 14px;
    max-width: 380px;
  }
`;

export const AsideFoot = styled.div`
  position: relative;
  z-index: 1;
  font-size: var(--fontSizes-small);
  color: rgba(255, 255, 255, 0.6);
`;

export const Mascot = styled.img`
  position: absolute;
  right: -90px;
  bottom: 30px;
  width: 500px;
  height: auto;
  pointer-events: none;
  user-select: none;
  filter: drop-shadow(0 24px 48px rgba(0, 0, 0, 0.25));
`;

/* Coluna do formulário */
export const Main = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--colors-backgroundSection);
`;

export const FormBox = styled(Box)`
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 18px;

  h1 {
    font-size: var(--fontSizes-h2);
    font-weight: var(--fontWeights-bold);
    letter-spacing: -0.02em;
  }

  .lede {
    font-size: var(--fontSizes-body2);
    color: var(--colors-textSecondary);
    margin-top: -8px;
  }

  form {
    display: flex;
    flex-direction: column;
  }
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0 8px;
`;

export const MiniLink = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: var(--fontSizes-small);
  color: var(--colors-primary);

  &:hover {
    text-decoration: underline;
  }
`;
