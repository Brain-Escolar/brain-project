"use client";

import { createTheme } from "@mui/material/styles";

/**
 * Tema do Material UI alinhado ao Design System Brain.
 * Garante que componentes do MUI (botões, inputs, etc.) usem o azul da marca
 * e a tipografia Hanken Grotesk, respeitando os modos claro e escuro.
 */
export function buildMuiTheme(mode: "light" | "dark") {
  const isLight = mode === "light";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isLight ? "#1E4BC8" : "#6A8CEB",
        dark: "#1A40AB",
        light: "#6A8CEB",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: isLight ? "#6A8CEB" : "#93AEF2",
        contrastText: "#FFFFFF",
      },
      error: { main: isLight ? "#EF4444" : "#F87171" },
      success: { main: isLight ? "#16A34A" : "#4ADE80" },
      warning: { main: isLight ? "#F59E0B" : "#FBBF24" },
      background: {
        default: isLight ? "#F8FAFC" : "#141A24",
        paper: isLight ? "#FFFFFF" : "#1C2430",
      },
      text: {
        primary: isLight ? "#141414" : "#F8FAFC",
        secondary: isLight ? "#525252" : "#A0AEC0",
      },
      divider: isLight ? "#E2E8F0" : "#2D3748",
    },
    shape: {
      // Cantos arredondados — linguagem amigável e moderna.
      borderRadius: 12,
    },
    typography: {
      fontFamily: "var(--font-hanken), 'Hanken Grotesk', sans-serif",
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
        },
      },
    },
  });
}
