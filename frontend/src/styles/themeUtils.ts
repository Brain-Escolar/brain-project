import { lightTheme, ThemeType } from "./theme";
import { css, DefaultTheme } from "styled-components";

type CSSVarColor = ThemeType["colors"];

export function createCSSVariables(theme: ThemeType): Record<string, string> {
  const cssVariables: Record<string, string> = {};

  // Iterate through the theme object and create CSS variables
  for (const [key, value] of Object.entries(theme)) {
    if (typeof value === "object") {
      for (const [subKey, subValue] of Object.entries(value)) {
        cssVariables[`--${key}-${subKey}`] = subValue as string;
      }
    } else {
      cssVariables[`--${key}`] = value;
    }
  }

  return cssVariables;
}

export const generateCSSVariables = (variables: DefaultTheme) => css`
  ${Object.entries(createCSSVariables(variables))
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n")}
`;

export function cssVarColor(color: keyof CSSVarColor): string {
  const listCssVariables = createCSSVariables(lightTheme);

  const findNameVariable = Object.entries(listCssVariables).find(
    ([key]) => key === `--colors-${color}`,
  );
  if (findNameVariable) {
    const nameVariable = findNameVariable[0];
    return `var(${nameVariable})`;
  }
  return "";
}
