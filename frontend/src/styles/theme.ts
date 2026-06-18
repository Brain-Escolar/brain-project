import { DefaultTheme } from "styled-components";

/**
 * Tipografia compartilhada — escala baseada na proporção 1.2.
 * Os tamanhos e pesos seguem o Design System Brain.
 */
const fontSizes = {
  h1: "2.074rem",
  h2: "1.728rem",
  h3: "1.44rem",
  h4: "1.2rem",
  body1: "1rem",
  body2: "0.833rem",
  small: "0.694rem",
} as const;

const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

/** Família tipográfica oficial: Hanken Grotesk (carregada via next/font). */
const fonts = {
  body: "var(--font-hanken), 'Hanken Grotesk', sans-serif",
  heading: "var(--font-hanken), 'Hanken Grotesk', sans-serif",
} as const;

/**
 * Cantos arredondados — linguagem visual amigável e moderna.
 * sm: inputs/badges · md: cards/botões · lg: modais · pill: elementos circulares.
 */
const radii = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "18px",
  pill: "9999px",
} as const;

/**
 * Elevação — hierarquia visual por profundidade.
 * level1: cards/inputs · level2: menus/sidebars · level3: modais/dialogs.
 */
const lightShadows = {
  // Sombra fria com tinta índigo (rgba 20,28,58) — mantém a profundidade sutil e on-brand.
  level1: "0 1px 2px rgba(20, 28, 58, 0.06), 0 1px 3px rgba(20, 28, 58, 0.08)",
  level2: "0 2px 4px rgba(20, 28, 58, 0.06), 0 4px 12px rgba(20, 28, 58, 0.08)",
  level3: "0 4px 8px rgba(20, 28, 58, 0.08), 0 12px 24px rgba(20, 28, 58, 0.12)",
} as const;

const darkShadows = {
  level1: "0 1px 2px rgba(0, 0, 0, 0.30), 0 1px 3px rgba(0, 0, 0, 0.40)",
  level2: "0 2px 4px rgba(0, 0, 0, 0.30), 0 4px 8px rgba(0, 0, 0, 0.45)",
  level3: "0 4px 8px rgba(0, 0, 0, 0.35), 0 12px 24px rgba(0, 0, 0, 0.55)",
} as const;

export const lightTheme: DefaultTheme = {
  colors: {
    // Fundo principal — "Gelo" (#F8FAFC): leveza, clareza e sofisticação.
    background: "#F8FAFC",
    backgroundHover: "#EEF2F7",
    backgroundSection: "#FFFFFF",
    // Superfície "afundada" — fundo de cabeçalhos de tabela, trilhos de toggle.
    surfaceSunken: "#EEF0F4",
    // Tipografia — "Carvão" (#141414): principal cor de leitura.
    text: "#141414",
    textSecondary: "#525252",
    textTertiary: "#9AA1B2",
    // Azul Brilhante (#1E4BC8) — cor primária da marca Brain.
    primary: "#1E4BC8",
    primaryHover: "#1A40AB",
    primaryActive: "#1B3784",
    // Fundo primário tênue — destaques, "próxima aula", chips de agenda.
    primarySubtle: "#EEF3FE",
    primarySubtleHover: "#DCE6FD",
    // Azul Claro (#6A8CEB) — cor secundária / apoio.
    secondary: "#6A8CEB",
    secondaryStrong: "#3A5DD1",
    accent: "#6A8CEB",
    headerMenu: "#1E4BC8",
    border: "#E2E8F0",
    borderSubtle: "#E2E5EC",
    // Estados — base + fundo tênue + texto legível sobre o tênue.
    error: "#EF4444",
    errorSubtle: "#FEF2F2",
    errorText: "#B91C1C",
    success: "#16A34A",
    successSubtle: "#ECFDF5",
    successText: "#047857",
    warning: "#F59E0B",
    warningSubtle: "#FFFBEB",
    warningText: "#B45309",
    info: "#6A8CEB",
    infoSubtle: "#EFF6FF",
    infoText: "#1D4ED8",
  },
  fonts,
  fontSizes,
  fontWeights,
  radii,
  shadows: lightShadows,
} as const;

export const darkTheme: DefaultTheme = {
  colors: {
    background: "#141A24",
    backgroundHover: "#243040",
    backgroundSection: "#1C2430",
    surfaceSunken: "#0E1117",
    text: "#F8FAFC",
    textSecondary: "#A0AEC0",
    textTertiary: "#6B7384",
    // No escuro o azul claro garante melhor contraste, mantendo a família da marca.
    primary: "#6A8CEB",
    primaryHover: "#93AEF2",
    primaryActive: "#93AEF2",
    primarySubtle: "rgba(106, 140, 235, 0.18)",
    primarySubtleHover: "rgba(106, 140, 235, 0.28)",
    secondary: "#93AEF2",
    secondaryStrong: "#93AEF2",
    accent: "#6A8CEB",
    headerMenu: "#0F172A",
    border: "#2D3748",
    borderSubtle: "#262B36",
    error: "#F87171",
    errorSubtle: "rgba(239, 68, 68, 0.16)",
    errorText: "#FECACA",
    success: "#4ADE80",
    successSubtle: "rgba(16, 185, 129, 0.16)",
    successText: "#A7F3D0",
    warning: "#FBBF24",
    warningSubtle: "rgba(245, 158, 11, 0.16)",
    warningText: "#FDE68A",
    info: "#93AEF2",
    infoSubtle: "rgba(96, 165, 250, 0.16)",
    infoText: "#BFDBFE",
  },
  fonts,
  fontSizes,
  fontWeights,
  radii,
  shadows: darkShadows,
} as const;

export type ThemeType = typeof lightTheme;
