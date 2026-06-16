import { createGlobalStyle } from "styled-components";
import { darkTheme, lightTheme } from "./theme";
import { generateCSSVariables } from "./themeUtils";

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    font-size: 100%;
    line-height: 1.5;
    font-family: var(--fonts-body);
    font-size: var(--fontSizes-body1);
    font-weight: var(--fontWeights-regular);
    color: var(--colors-text);
    background-color: var(--colors-background);
  }


  button, input, textarea, select {
    font: inherit;
  }

  :root {
    ${generateCSSVariables(lightTheme)}
  }

  .app{
    min-height: 100%;
    background-color: var(--colors-background);
  }
  [data-theme="dark"] { 
    ${generateCSSVariables(darkTheme)}
  }

  [data-theme='dark'] [data-hide-on-theme='dark'],
  [data-theme='light'] [data-hide-on-theme='light'] {
    display: none;
  }

  p, span, h1, h2, h3, h4, h5, h6 {
    color: var(--colors-text);
  }

  /* Escala tipográfica Brain (proporção 1.2) */
  h1 {
    font-family: var(--fonts-heading);
    font-size: var(--fontSizes-h1);
    font-weight: var(--fontWeights-bold);
    line-height: 1.2;
  }

  h2 {
    font-family: var(--fonts-heading);
    font-size: var(--fontSizes-h2);
    font-weight: var(--fontWeights-semibold);
    line-height: 1.25;
  }

  h3 {
    font-family: var(--fonts-heading);
    font-size: var(--fontSizes-h3);
    font-weight: var(--fontWeights-medium);
    line-height: 1.3;
  }

  h4 {
    font-family: var(--fonts-heading);
    font-size: var(--fontSizes-h4);
    font-weight: var(--fontWeights-medium);
    line-height: 1.35;
  }
`;
export default GlobalStyle;
