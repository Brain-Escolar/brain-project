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
`;
export default GlobalStyle;
