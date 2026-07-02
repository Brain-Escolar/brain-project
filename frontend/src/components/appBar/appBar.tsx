"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AppBar as MuiAppBar, Badge, Container, IconButton, Toolbar, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import MenuRounded from "@mui/icons-material/MenuRounded";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadConversas } from "@/hooks/useConversas";
import { NotificationMenu } from "@/components/appBar/notificationMenu";
import { useTheme } from "@mui/material/styles";
import { UserMenu } from "@/components/appBar/userMenu";
import { DynamicModuleMenu } from "@/components/appBar/dynamicModuleMenu/DynamicModuleMenu";
import { MobileNavDrawer } from "@/components/appBar/mobileNavDrawer/MobileNavDrawer";
import { getMenuModules, getRoutesWithoutModule } from "@/constants/routesConfig";

export default function AppBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const theme = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

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
  const appBarTextMuted = theme.palette.text.secondary;
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
        width: "100%",
        bgcolor: appBarBg,
        color: appBarText,
        borderBottom: "1px solid",
        borderBottomColor: appBarBorder,
        boxShadow: "var(--shadows-level1)",
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3 } }}>
        <Toolbar disableGutters sx={{ minHeight: "4rem" }}>
          <IconButton
            aria-label="Abrir menu"
            onClick={() => setMobileNavOpen(true)}
            sx={{ display: { xs: "inline-flex", md: "none" }, mr: 1, color: appBarText }}
          >
            <MenuRounded />
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
              display: { xs: "none", md: "flex" },
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

      <MobileNavDrawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        role={user.role}
        directRoutes={directRoutes}
        moduleMenus={moduleMenus}
        unreadConversas={unreadConversas}
        logoSrc={logoSrc}
      />
    </MuiAppBar>
  );
}
