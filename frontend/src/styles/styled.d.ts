// styles/styled.d.ts
import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      background: string;
      backgroundHover: string;
      backgroundSection: string;
      surfaceSunken: string;
      text: string;
      textSecondary: string;
      textTertiary: string;
      primary: string;
      primaryHover: string;
      primaryActive: string;
      primarySubtle: string;
      primarySubtleHover: string;
      secondary: string;
      secondaryStrong: string;
      accent: string;
      headerMenu: string;
      border: string;
      borderSubtle: string;
      error: string;
      errorSubtle: string;
      errorText: string;
      success: string;
      successSubtle: string;
      successText: string;
      warning: string;
      warningSubtle: string;
      warningText: string;
      info: string;
      infoSubtle: string;
      infoText: string;
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
      xl: string;
      pill: string;
    };
    shadows: {
      level1: string;
      level2: string;
      level3: string;
    };
  }
}
