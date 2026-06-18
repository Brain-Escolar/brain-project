"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AppBar as MuiAppBar, Badge, Container, IconButton, Toolbar, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "@/hooks/useAuth";
import { useDrawer } from "@/contexts/DrawerContext";
import { useUnreadConversas } from "@/hooks/useConversas";
import { NotificationMenu } from "@/components/appBar/notificationMenu";
import { useTheme } from "@mui/material/styles";
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
  const theme = useTheme();

  const directRoutes = React.useMemo(
    () => (user ? getRoutesWithoutModule(user.role) : []),
    [user],
  );

  const moduleMenus = React.useMemo(
    () => (user ? getMenuModules(user.role) : []),
    [user],
  );

  const unreadConversas = useUnreadConversas();

  if (!user) {
    return null;
  }

  // Cores derivadas do Design System Brain (tema MUI: claro/escuro automático).
  const appBarBg = theme.palette.background.paper;
  const appBarBorder = theme.palette.divider;
  const appBarText = theme.palette.text.primary;
  const appBarTextMuted = theme.palette.text.menu;
  const accent = theme.palette.primary.main; // Azul Brilhante #1E4BC8
  const menuBg = theme.palette.background.paper;
  const menuHoverBg = theme.palette.action.hover;
  const logoSrc =
    theme.palette.mode === "dark"
      ? "/brand/logo/brain-wordmark-branco.svg"
      : "/brand/logo/brain-wordmark-azul.svg";

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
        boxShadow: "var(--shadows-level1)",
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

          <Link
            href="/"
            aria-label="Brain"
            style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
          >
            <Image
              src={logoSrc}
              alt="Brain"
              width={81}
              height={28}
              priority
              unoptimized
              style={{ height: 28, width: "auto" }}
            />
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
              const badgeCount = route.showBadge ? unreadConversas : 0;
              return (
                <Link key={route.router} href={route.router} style={{ textDecoration: "none" }}>
                  <Badge badgeContent={badgeCount} color="error" max={99}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        py: 0.5,
                        color: isActive ? accent : appBarTextMuted,
                        transition: "color 0.15s ease",
                        "&:hover": { color: theme.palette.text.primary },
                      }}
                    >
                      {React.cloneElement(route.icon, { sx: { fontSize: 20, color: "inherit" } })}
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: isActive ? 600 : 500, color: "inherit", fontSize: "14px" }}
                      >
                        {route.text}
                      </Typography>
                    </Box>
                  </Badge>
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
                accentColor={accent}
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
