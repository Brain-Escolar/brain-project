"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { buildMuiTheme } from "./muiTheme";

/**
 * Conecta o tema do Material UI ao tema da aplicação (next-themes),
 * trocando entre claro e escuro de acordo com a preferência do usuário.
 */
function BrainMuiThemeProvider({ children }: React.PropsWithChildren) {
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme === "dark" ? "dark" : "light";

  const theme = React.useMemo(() => buildMuiTheme(mode), [mode]);

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}

export default BrainMuiThemeProvider;
