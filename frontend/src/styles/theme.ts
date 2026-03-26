import { DefaultTheme } from "styled-components";

export const lightTheme: DefaultTheme = {
  colors: {
    background: "#F9FAFB",
    backgroundHover: "#E5E7EB",
    text: "#363f4bff",
    textSecondary: "#71717a",
    primary: "#3B82F6",
    secondary: "#6366F1",
    accent: "#10B981",
    headerMenu: "#3B82F6",
    border: "#e4e4e7",
    backgroundSection: "#FFFFFF",
    error: "#EF4444",
  },
  fonts: {
    body: "'Inter', sans-serif",
    heading: "'Poppins', sans-serif",
  },
} as const;

export const darkTheme: DefaultTheme = {
  colors: {
    background: "#282828",
    backgroundHover: "#3A3A3A",
    text: "#F9FAFB",
    textSecondary: "#D1D5DB",
    primary: "#60A5FA",
    secondary: "#A78BFA",
    accent: "#34D399",
    headerMenu: "#0F172A",
    border: "#374151",
    backgroundSection: "#FFFFFF",
    error: "#EF4444",
  },
  fonts: {
    body: "'Inter', sans-serif",
    heading: "'Poppins', sans-serif",
  },
} as const;

export type ThemeType = typeof lightTheme;
