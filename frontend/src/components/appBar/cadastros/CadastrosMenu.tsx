"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ListItemIcon, ListItemText, Menu, MenuItem, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import FolderIcon from "@mui/icons-material/Folder";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { RoutesModuleEnum } from "@/enums";
import { getRoutesByModule } from "@/constants/routesConfig";
import type { UserRoleEnum } from "@/enums";

export interface CadastrosMenuProps {
  role: UserRoleEnum;
  menuBg: string;
  menuHoverBg: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
}

export function CadastrosMenu({
  role,
  menuBg,
  menuHoverBg,
  textColor,
  mutedTextColor,
  borderColor,
}: CadastrosMenuProps) {
  const router = useRouter();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const routes = React.useMemo(() => getRoutesByModule(role, RoutesModuleEnum.CADASTROS), [role]);

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
          cursor: "pointer",
          color: open ? textColor : mutedTextColor,
          "&:hover": { color: textColor },
          userSelect: "none",
        }}
        aria-haspopup="menu"
        aria-expanded={open ? "true" : undefined}
        aria-controls={open ? "menu-cadastros" : undefined}
      >
        <FolderIcon sx={{ fontSize: 20, color: "inherit" }} />
        <Typography
          variant="caption"
          sx={{
            fontWeight: open ? 600 : 400,
            color: "inherit",
            fontSize: "14px",
          }}
        >
          Cadastros
        </Typography>
        <KeyboardArrowDownIcon sx={{ fontSize: 18, color: "inherit", opacity: 0.9 }} />
      </Box>

      <Menu
        id="menu-cadastros"
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
              boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
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
