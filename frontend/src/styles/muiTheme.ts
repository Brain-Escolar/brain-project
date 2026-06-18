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
      error: {
        main: isLight ? "#EF4444" : "#F87171",
        light: isLight ? "#FEF2F2" : "rgba(239, 68, 68, 0.16)",
        dark: isLight ? "#B91C1C" : "#FECACA",
      },
      success: {
        main: isLight ? "#16A34A" : "#4ADE80",
        light: isLight ? "#ECFDF5" : "rgba(16, 185, 129, 0.16)",
        dark: isLight ? "#047857" : "#A7F3D0",
      },
      warning: {
        main: isLight ? "#F59E0B" : "#FBBF24",
        light: isLight ? "#FFFBEB" : "rgba(245, 158, 11, 0.16)",
        dark: isLight ? "#B45309" : "#FDE68A",
      },
      info: {
        main: isLight ? "#1E4BC8" : "#6A8CEB",
        light: isLight ? "#EFF6FF" : "rgba(96, 165, 250, 0.16)",
        dark: isLight ? "#1D4ED8" : "#BFDBFE",
      },
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
