"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Badge,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import CloseRounded from "@mui/icons-material/CloseRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { getRoutesByModule } from "@/constants/routesConfig";
import type { RouteConfig, MenuModule } from "@/constants/routesConfig";
import type { UserRoleEnum } from "@/enums";

export interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  role: UserRoleEnum;
  directRoutes: RouteConfig[];
  moduleMenus: MenuModule[];
  unreadConversas: number;
  logoSrc: string;
}

function ModuleSection({
  mod,
  role,
  pathname,
  onNavigate,
}: {
  mod: MenuModule;
  role: UserRoleEnum;
  pathname: string;
  onNavigate: () => void;
}) {
  const routes = React.useMemo(() => getRoutesByModule(role, mod.id), [role, mod.id]);
  const isActive = routes.some((r) => pathname === r.router || pathname.startsWith(r.router + "/"));
  const [expanded, setExpanded] = React.useState(isActive);

  if (routes.length === 0) return null;

  return (
    <>
      <ListItemButton onClick={() => setExpanded((prev) => !prev)} sx={{ py: 1.25 }}>
        <ListItemIcon sx={{ minWidth: 36 }}>
          {React.cloneElement(mod.icon, { fontSize: "small" })}
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography sx={{ fontSize: 14, fontWeight: isActive ? 600 : 500 }}>{mod.text}</Typography>
          }
        />
        <KeyboardArrowDownIcon
          sx={{
            fontSize: 20,
            transition: "transform 0.15s ease",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </ListItemButton>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List disablePadding>
          {routes.map((route) => {
            const routeActive = pathname === route.router;
            return (
              <ListItemButton
                key={route.router}
                component={Link}
                href={route.router}
                onClick={onNavigate}
                sx={{ py: 1, pl: 5 }}
                selected={routeActive}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {React.cloneElement(route.icon, { fontSize: "small" })}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: 14, fontWeight: routeActive ? 600 : 500 }}>
                      {route.text}
                    </Typography>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>
      </Collapse>
    </>
  );
}

export function MobileNavDrawer({
  open,
  onClose,
  role,
  directRoutes,
  moduleMenus,
  unreadConversas,
  logoSrc,
}: MobileNavDrawerProps) {
  const pathname = usePathname();

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 280 } } }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderBottomColor: "divider",
        }}
      >
        <Image src={logoSrc} alt="Brain" width={81} height={28} unoptimized style={{ height: 28, width: "auto" }} />
        <IconButton onClick={onClose} aria-label="Fechar menu" size="small">
          <CloseRounded />
        </IconButton>
      </Box>

      <List disablePadding sx={{ py: 1 }}>
        {directRoutes.map((route) => {
          const isActive = pathname === route.router;
          const badgeCount = route.showBadge ? unreadConversas : 0;
          return (
            <ListItemButton
              key={route.router}
              component={Link}
              href={route.router}
              onClick={onClose}
              selected={isActive}
              sx={{ py: 1.25 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Badge badgeContent={badgeCount} color="error" max={99}>
                  {React.cloneElement(route.icon, { fontSize: "small" })}
                </Badge>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: 14, fontWeight: isActive ? 600 : 500 }}>
                    {route.text}
                  </Typography>
                }
              />
            </ListItemButton>
          );
        })}

        {moduleMenus.length > 0 && directRoutes.length > 0 && <Divider sx={{ my: 1 }} />}

        {moduleMenus.map((mod) => (
          <ModuleSection key={mod.id} mod={mod} role={role} pathname={pathname} onNavigate={onClose} />
        ))}
      </List>
    </Drawer>
  );
}
