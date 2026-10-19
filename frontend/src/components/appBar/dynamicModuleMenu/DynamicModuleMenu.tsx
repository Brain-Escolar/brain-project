"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Popover,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { getRoutesByModule, getSectionsByModule } from "@/constants/routesConfig";
import type { RouteConfig } from "@/constants/routesConfig";
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
  const sections = React.useMemo(() => getSectionsByModule(role, moduleId), [role, moduleId]);
  const [sectionId, setSectionId] = React.useState(sections[0]?.id);

  if (routes.length === 0) return null;

  const accent = accentColor ?? textColor;
  const routeIsActive = (r: RouteConfig) =>
    pathname === r.router || pathname.startsWith(r.router + "/");
  const isActive = routes.some(routeIsActive);
  const highlighted = open || isActive;

  const menuId = `menu-module-${moduleId}`;

  const openMenu = (target: HTMLElement) => {
    // Abre na aba do setor da página atual, ou na primeira.
    const current = sections.find((s) => s.routes.some(routeIsActive)) ?? sections[0];
    setSectionId(current?.id);
    setAnchorEl(target);
  };

  const paperSx = {
    mt: 1,
    borderRadius: 2,
    overflow: "hidden",
    bgcolor: menuBg,
    color: textColor,
    border: "1px solid",
    borderColor,
    boxShadow: "var(--shadows-level3)",
  };

  const renderItem = (route: RouteConfig) => (
    <MenuItem
      key={route.router}
      selected={routeIsActive(route)}
      onClick={() => {
        router.push(route.router);
        setAnchorEl(null);
      }}
      sx={{ px: 2, py: 1.25, minHeight: 44, "&:hover": { bgcolor: menuHoverBg } }}
    >
      <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>{route.icon}</ListItemIcon>
      <ListItemText
        primary={
          <Typography
            sx={{ fontSize: 14, color: "inherit", fontWeight: route.caption ? 600 : 400 }}
          >
            {route.text}
          </Typography>
        }
        secondary={
          route.caption ? (
            <Typography sx={{ fontSize: 12, color: mutedTextColor, mt: 0.25 }}>
              {route.caption}
            </Typography>
          ) : undefined
        }
      />
    </MenuItem>
  );

  const activeSection = sections.find((s) => s.id === sectionId) ?? sections[0];

  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        onClick={(e) => openMenu(e.currentTarget as HTMLElement)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openMenu(e.currentTarget as HTMLElement);
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

      {activeSection ? (
        <Popover
          id={menuId}
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{ paper: { sx: { ...paperSx, display: "flex" } } }}
        >
          <Tabs
            orientation="vertical"
            value={activeSection.id}
            onChange={(_, value) => setSectionId(value)}
            sx={{
              minWidth: 200,
              py: 1,
              borderRight: "1px solid",
              borderRightColor: borderColor,
              "& .MuiTabs-indicator": { left: 0, bgcolor: accent },
            }}
          >
            {sections.map((section) => (
              <Tab
                key={section.id}
                value={section.id}
                label={section.text}
                icon={section.icon}
                iconPosition="start"
                onMouseEnter={() => setSectionId(section.id)}
                sx={{
                  minHeight: 44,
                  px: 2,
                  justifyContent: "flex-start",
                  textTransform: "none",
                  fontSize: 14,
                  color: mutedTextColor,
                  "&.Mui-selected": { color: accent, fontWeight: 600, bgcolor: menuHoverBg },
                }}
              />
            ))}
          </Tabs>
          <MenuList
            aria-label={activeSection.text}
            sx={{ minWidth: 240, py: 1, alignSelf: "flex-start" }}
          >
            {activeSection.routes.map(renderItem)}
          </MenuList>
        </Popover>
      ) : (
        <Menu
          id={menuId}
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{
            paper: { sx: { ...paperSx, minWidth: 240 } },
            list: { disablePadding: true },
          }}
        >
          {routes.map(renderItem)}
        </Menu>
      )}
    </>
  );
}
