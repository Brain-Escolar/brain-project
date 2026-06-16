import CustomProviderTheme from "@/styles/Providers";
import BrainMuiThemeProvider from "@/styles/BrainMuiThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ToastContainer } from "react-toastify";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brain",
  description: "Brain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className={hankenGrotesk.variable}>
        <ThemeProvider>
          <AppRouterCacheProvider>
            <BrainMuiThemeProvider>
              <CustomProviderTheme>
                <AuthProvider>
                  <CssBaseline />
                  <div className="app">
                    {children}
                    <ToastContainer />
                  </div>
                </AuthProvider>
              </CustomProviderTheme>
            </BrainMuiThemeProvider>
          </AppRouterCacheProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
