"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { ListItemIcon, ListItemText, Menu, MenuItem, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { getRoutesByModule } from "@/constants/routesConfig";
import type { UserRoleEnum, RoutesModuleEnum } from "@/enums";

export interface DynamicModuleMenuProps {
  role: UserRoleEnum;
  moduleId: RoutesModuleEnum;
  moduleText: string;
  moduleIcon: React.JSX.Element;
  menuBg: string;
  menuHoverBg: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  /** Cor de destaque (azul da marca) para hover/ativo do gatilho do menu. */
  accentColor?: string;
}

export function DynamicModuleMenu({
  role,
  moduleId,
  moduleText,
  moduleIcon,
  menuBg,
  menuHoverBg,
  textColor,
  mutedTextColor,
  borderColor,
  accentColor,
}: DynamicModuleMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const routes = React.useMemo(() => getRoutesByModule(role, moduleId), [role, moduleId]);

  if (routes.length === 0) return null;

  const accent = accentColor ?? textColor;
  const isActive = routes.some(
    (r) => pathname === r.router || pathname.startsWith(r.router + "/"),
  );
  const highlighted = open || isActive;

  const menuId = `menu-module-${moduleId}`;

  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        onClick={(e) => setAnchorEl(e.currentTarget as HTMLElement)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setAnchorEl(e.currentTarget as HTMLElement);
          }
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          py: 0.5,
          cursor: "pointer",
          borderBottom: "2px solid",
          borderBottomColor: highlighted ? accent : "transparent",
          color: highlighted ? accent : mutedTextColor,
          transition: "color 0.15s ease, border-color 0.15s ease",
          "&:hover": { color: accent },
          userSelect: "none",
        }}
        aria-haspopup="menu"
        aria-expanded={open ? "true" : undefined}
        aria-controls={open ? menuId : undefined}
      >
        {React.cloneElement(moduleIcon, { sx: { fontSize: 20, color: "inherit" } })}
        <Typography
          variant="caption"
          sx={{ fontWeight: highlighted ? 600 : 500, color: "inherit", fontSize: "14px" }}
        >
          {moduleText}
        </Typography>
        <KeyboardArrowDownIcon sx={{ fontSize: 18, color: "inherit", opacity: 0.9 }} />
      </Box>

      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 240,
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: menuBg,
              color: textColor,
              border: "1px solid",
              borderColor,
              boxShadow: "var(--shadows-level3)",
            },
          },
          list: { disablePadding: true },
        }}
      >
        {routes.map((route) => (
          <MenuItem
            key={route.router}
            onClick={() => {
              router.push(route.router);
              setAnchorEl(null);
            }}
            sx={{ px: 2, py: 1.25, minHeight: 44, "&:hover": { bgcolor: menuHoverBg } }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>{route.icon}</ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontSize: 14, color: "inherit" }}>{route.text}</Typography>
              }
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
