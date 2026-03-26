import CustomProviderTheme from "@/styles/Providers";
import { AuthProvider } from "@/hooks/useAuth";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ToastContainer } from "react-toastify";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>
          <AppRouterCacheProvider>
            <CustomProviderTheme>
              <AuthProvider>
                <CssBaseline />
                <div className="app">
                  {children}
                  <ToastContainer />
                </div>
              </AuthProvider>
            </CustomProviderTheme>
          </AppRouterCacheProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
