"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { RoutesEnum, UserRoleEnum } from "@/enums";

export interface UserMenuProps {
  user: {
    email: string;
    name: string;
    role: UserRoleEnum;
  };
  menuBg?: string;
  menuHoverBg?: string;
  textColor?: string;
  mutedTextColor?: string;
  dividerColor?: string;
  avatarSrc?: string;
}

export function UserMenu({
  user,
  menuBg = "#ffffff",
  menuHoverBg = "rgba(0,0,0,0.04)",
  textColor = "rgba(0,0,0,0.87)",
  mutedTextColor = "rgba(0,0,0,0.6)",
  dividerColor = "#e6e6e6",
  avatarSrc = "/static/images/avatar/2.jpg",
}: UserMenuProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const isDarkMode = resolvedTheme === "dark";
  const themeMenuItem = isDarkMode
    ? { label: "Ativar tema claro", Icon: LightModeOutlinedIcon, nextTheme: "light" as const }
    : { label: "Ativar tema escuro", Icon: DarkModeOutlinedIcon, nextTheme: "dark" as const };

  const displayName = user.name ?? user.email.split("@")[0] ?? "Usuário";
  const roleLabel = user.role === UserRoleEnum.PROFESSOR ? "Professor" : user.role;
  const secondaryLine = roleLabel ?? user.email;

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleNavigate = (route: string) => {
    router.push(route);
    handleCloseUserMenu();
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <>
      <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
        <Avatar alt={displayName} src={avatarSrc}>
          {user.name.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <Menu
        sx={{ mt: "45px" }}
        id="menu-appbar-user"
        anchorEl={anchorElUser}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        keepMounted
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
        slotProps={{
          paper: {
            sx: {
              width: 300,
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: menuBg,
              color: textColor,
              boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
            },
          },
          list: {
            disablePadding: true,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.75, display: "flex", gap: 1.5, alignItems: "center" }}>
          <Avatar alt={displayName} src={avatarSrc} sx={{ width: 40, height: 40 }}>
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
              {displayName}
            </Typography>
            <Typography variant="body2" sx={{ color: mutedTextColor }} noWrap>
              {secondaryLine}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: dividerColor }} />

        <MenuItem
          onClick={() => handleNavigate(RoutesEnum.PERFIL)}
          sx={{ px: 2, py: 1, mt: 0.5, minHeight: 48, "&:hover": { bgcolor: menuHoverBg } }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography sx={{ fontSize: 16, color: "inherit" }}>Acessar perfil</Typography>
            }
          />
        </MenuItem>

        <Divider sx={{ borderColor: dividerColor }} />

        <MenuItem
          onClick={() => {
            setTheme(themeMenuItem.nextTheme);
            handleCloseUserMenu();
          }}
          sx={{ px: 2, py: 1, minHeight: 48, "&:hover": { bgcolor: menuHoverBg } }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
            <themeMenuItem.Icon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography sx={{ fontSize: 16, color: "inherit" }}>{themeMenuItem.label}</Typography>
            }
          />
        </MenuItem>

        <MenuItem
          onClick={() => handleNavigate(RoutesEnum.CONFIGURACOES)}
          sx={{ px: 2, py: 1, minHeight: 48, "&:hover": { bgcolor: menuHoverBg } }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography sx={{ fontSize: 16, color: "inherit" }}>Configurações</Typography>}
          />
        </MenuItem>

        <Divider sx={{ borderColor: dividerColor }} />

        <MenuItem
          onClick={handleLogout}
          sx={{ px: 2, py: 1.25, my: 0.5, minHeight: 48, "&:hover": { bgcolor: menuHoverBg } }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography sx={{ fontSize: 16, color: "inherit" }}>Sair</Typography>}
          />
        </MenuItem>
      </Menu>
    </>
  );
}
