"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppBar as MuiAppBar, Container, IconButton, Toolbar, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "@/hooks/useAuth";
import { useDrawer } from "@/contexts/DrawerContext";
import { NotificationMenu } from "@/components/appBar/notificationMenu";
import { useTheme } from "next-themes";
import { UserMenu } from "@/components/appBar/userMenu";
import { DynamicModuleMenu } from "@/components/appBar/dynamicModuleMenu/DynamicModuleMenu";
import { getMenuModules, getRoutesWithoutModule } from "@/constants/routesConfig";

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_CLOSED = 60;

interface AppBarProps {
  onMobileMenuClick?: () => void;
  /** Enable left offset + width shrink for the sidebar drawer */
  enableDrawerOffset?: boolean;
}

export default function AppBar({ onMobileMenuClick, enableDrawerOffset = false }: AppBarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { drawerOpen } = useDrawer();
  const { resolvedTheme } = useTheme();

  const isDarkMode = resolvedTheme === "dark";

  const directRoutes = React.useMemo(
    () => (user ? getRoutesWithoutModule(user.role) : []),
    [user],
  );

  const moduleMenus = React.useMemo(
    () => (user ? getMenuModules(user.role) : []),
    [user],
  );

  if (!user) {
    return null;
  }

  const appBarBg = isDarkMode ? "#121212" : "#ffffff";
  const appBarBorder = isDarkMode ? "rgba(255,255,255,0.12)" : "#e6e6e6";
  const appBarText = isDarkMode ? "rgba(255,255,255,0.87)" : "rgba(0,0,0,0.87)";
  const appBarTextMuted = isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.76)";
  const menuBg = isDarkMode ? "#1E1E1E" : "#ffffff";
  const menuHoverBg = isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  return (
    <MuiAppBar
      position="fixed"
      color="default"
      sx={{
        marginLeft: enableDrawerOffset
          ? { xs: 0, md: drawerOpen ? `${DRAWER_WIDTH}px` : `${DRAWER_WIDTH_CLOSED}px` }
          : 0,
        width: enableDrawerOffset
          ? {
              xs: "100%",
              md: drawerOpen
                ? `calc(100% - ${DRAWER_WIDTH}px)`
                : `calc(100% - ${DRAWER_WIDTH_CLOSED}px)`,
            }
          : "100%",
        bgcolor: appBarBg,
        color: appBarText,
        borderBottom: "1px solid",
        borderBottomColor: appBarBorder,
        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
        transition: (theme) =>
          theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3 } }}>
        <Toolbar disableGutters sx={{ minHeight: 52 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMobileMenuClick}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <Typography
              variant="h5"
              noWrap
              sx={{ fontWeight: 700, color: "inherit", textDecoration: "none" }}
            >
              Brain
            </Typography>
          </Link>

          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 2.5,
              ml: 3,
            }}
          >
            {/* Rotas diretas (sem módulo) */}
            {directRoutes.map((route) => {
              const isActive = pathname === route.router;
              return (
                <Link key={route.router} href={route.router} style={{ textDecoration: "none" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      color: isActive ? appBarText : appBarTextMuted,
                      "&:hover": { color: appBarText },
                    }}
                  >
                    {React.cloneElement(route.icon, { sx: { fontSize: 20, color: "inherit" } })}
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: isActive ? 600 : 400, color: "inherit", fontSize: "14px" }}
                    >
                      {route.text}
                    </Typography>
                  </Box>
                </Link>
              );
            })}

            {/* Menus de módulos (dropdown) */}
            {moduleMenus.map((mod) => (
              <DynamicModuleMenu
                key={mod.id}
                role={user.role}
                moduleId={mod.id}
                moduleText={mod.text}
                moduleIcon={mod.icon}
                menuBg={menuBg}
                menuHoverBg={menuHoverBg}
                textColor={appBarText}
                mutedTextColor={appBarTextMuted}
                borderColor={appBarBorder}
              />
            ))}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ flexGrow: 0, display: "flex", alignItems: "center", gap: 1.5 }}>
            <NotificationMenu />
            <UserMenu
              user={{ email: user.email, name: user.name, role: user.role }}
              menuBg={menuBg}
              menuHoverBg={menuHoverBg}
              textColor={appBarText}
              mutedTextColor={appBarTextMuted}
              dividerColor={appBarBorder}
              avatarSrc="/static/images/avatar/2.jpg"
            />
          </Box>
        </Toolbar>
      </Container>
    </MuiAppBar>
  );
}
