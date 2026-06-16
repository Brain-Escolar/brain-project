// styles/styled.d.ts
import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      background: string;
      backgroundHover: string;
      backgroundSection: string;
      text: string;
      textSecondary: string;
      primary: string;
      primaryHover: string;
      secondary: string;
      accent: string;
      headerMenu: string;
      border: string;
      error: string;
      success: string;
      warning: string;
      info: string;
    };
    fonts: {
      body: string;
      heading: string;
    };
    fontSizes: {
      h1: string;
      h2: string;
      h3: string;
      h4: string;
      body1: string;
      body2: string;
      small: string;
    };
    fontWeights: {
      regular: string;
      medium: string;
      semibold: string;
      bold: string;
    };
    radii: {
      sm: string;
      md: string;
      lg: string;
      pill: string;
    };
    shadows: {
      level1: string;
      level2: string;
      level3: string;
    };
  }
}
