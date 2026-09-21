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

  /* Componentes MUI com fundo sólido azul/verde/vermelho (primary/success/error) devem
     ter texto branco. O MUI calcula o contrastText automaticamente e pode escolher preto
     nos tons mais claros do dark mode (success/error), por isso forçamos aqui. */
  .MuiButton-containedPrimary:not(.Mui-disabled),
  .MuiButton-containedSuccess:not(.Mui-disabled),
  .MuiButton-containedError:not(.Mui-disabled),
  .MuiChip-filled.MuiChip-colorPrimary:not(.Mui-disabled),
  .MuiChip-filled.MuiChip-colorSuccess:not(.Mui-disabled),
  .MuiChip-filled.MuiChip-colorError:not(.Mui-disabled) {
    color: #fff !important;
  }
`;
export default GlobalStyle;
