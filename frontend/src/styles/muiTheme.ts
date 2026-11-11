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
          root: ({ theme }) => ({
            borderRadius: 12,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
            // 44px e o minimo confortavel para o dedo (Apple HIG). Abaixo
            // disso o erro de toque deixa de ser raro -- e `size="small"`
            // aparece 324 vezes no projeto.
            [theme.breakpoints.down("sm")]: {
              minHeight: 44,
            },
          }),
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            padding: 0,
            minHeight: 48,
          },
        },
      },

      // ------------------------------------------------------------ celular
      //
      // O que segue vale só abaixo de `sm` e existe porque o sistema foi
      // desenhado no desktop: das 74 telas privadas, 12 consideravam tela
      // pequena. Resolver no tema alcança o app inteiro sem tocar em página
      // nenhuma -- e, mais importante, alcança as telas que ainda nem foram
      // escritas.

      /**
       * Modal ocupa a tela inteira no celular.
       *
       * Antes disto, um Dialog media 326x648 numa tela de 390x844: conteúdo
       * espremido numa janelinha com margem dos quatro lados, rolando por
       * dentro. Nenhum dos 57 arquivos com <Dialog> passava `fullScreen`.
       *
       * Feito por CSS e não por `fullScreen`, de propósito: a prop exigiria
       * um `useMediaQuery` em cada um dos 57 arquivos, e um esquecido volta
       * a ser janelinha. Aqui não há como esquecer.
       */
      MuiDialog: {
        styleOverrides: {
          paper: ({ theme }) => ({
            [theme.breakpoints.down("sm")]: {
              margin: 0,
              width: "100%",
              maxWidth: "100%",
              height: "100%",
              maxHeight: "100%",
              borderRadius: 0,
            },
          }),
        },
      },

      /**
       * A barra de ações do modal.
       *
       * No celular os botões empilham, um por linha. Num modal de tela cheia
       * esta barra é o rodapé, e lado a lado em 390px de largura cada botão
       * fica com ~175px: "Confirmar rejeição" e "Completar cadastro agora"
       * não cabem sem quebrar o rótulo no meio.
       *
       * `column-reverse` e não `column` porque em 65 dos 71 blocos
       * <DialogActions> o primeiro do DOM é a ação de sair (Cancelar, Fechar,
       * Voltar). Invertendo, a principal sobe e o sair desce, como nos apps,
       * sem reordenar o JSX de 65 arquivos -- e a ordem visual passa a ser a
       * mesma do desktop lida de outra direção: o botão mais à direita lá é o
       * de cima aqui.
       *
       * Com um botão só (5 blocos) não há o que empilhar: o `:has` pede um
       * irmão, e aí vale a regra de cima, onde o botão sozinho ocupa a
       * largura inteira.
       */
      MuiDialogActions: {
        styleOverrides: {
          root: ({ theme }) => ({
            [theme.breakpoints.down("sm")]: {
              padding: theme.spacing(2),
              gap: theme.spacing(1),
              justifyContent: "space-between",
              "& > .MuiButton-root": {
                minHeight: 44,
                flex: 1,
              },
              "&:has(> .MuiButton-root ~ .MuiButton-root)": {
                flexDirection: "column-reverse",
                alignItems: "stretch",
                "& > .MuiButton-root": {
                  minHeight: 44,
                  width: "100%",
                  // em coluna, `flex: 1` esticaria a altura, não a largura
                  flex: "none",
                  // o espaço lateral que o MUI põe entre irmãos vira o `gap`
                  marginLeft: 0,
                },
              },
            },
          }),
        },
      },

      /**
       * Alvo de toque mínimo.
       *
       * `size="small"` aparece 324 vezes no projeto -- no desktop fica
       * elegante, no dedo vira alvo de ~32px. 44px é o mínimo confortável
       * (Apple HIG); abaixo disso o erro de toque deixa de ser raro.
       */
      MuiIconButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            [theme.breakpoints.down("sm")]: {
              minHeight: 44,
              minWidth: 44,
            },
          }),
        },
      },
    },
  });
}
