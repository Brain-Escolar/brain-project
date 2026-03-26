"use client";
import {
  getMenuModules,
  getRoutesByModule,
  getRoutesWithoutModule,
  type RouteConfig,
  type MenuModule,
} from "@/constants/routesConfig";
import { RoutesModuleEnum } from "@/enums";
import { useAuth } from "@/hooks/useAuth";
import { useDrawer } from "@/contexts/DrawerContext";
import { NotificationMenu } from "@/components/appBar/notificationMenu";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useRouter, usePathname } from "next/navigation";

import {
  AppBar,
  Avatar,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  Collapse,
} from "@mui/material";
import Box from "@mui/material/Box";
import * as React from "react";
import * as S from "./styles";

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_CLOSED = 60;

const settings = [
  {
    text: "Perfil",
    icon: <PersonIcon fontSize="small" />,
    router: "/perfil",
  },
];

export default function DrawnerMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { drawerOpen, setDrawerOpen } = useDrawer();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [expandedModules, setExpandedModules] = React.useState<
    Partial<Record<RoutesModuleEnum, boolean>>
  >({});

  // Obtém os módulos, rotas com módulo e sem módulo baseadas no role do usuário
  const modules = user ? getMenuModules(user.role) : [];
  const routesWithoutModule = user ? getRoutesWithoutModule(user.role) : [];

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    signOut();
  };

  const handleNavigateToSetting = (route: string) => {
    router.push(route);
    handleCloseUserMenu();
  };

  const handleNavigateToPage = (route: string) => {
    router.push(route);
    handleDrawerClose();
    setMobileOpen(false);
  };

  const handleToggleModule = (moduleId: RoutesModuleEnum) => {
    // Se o drawer estiver fechado, abre primeiro
    if (!drawerOpen) {
      setDrawerOpen(true);
      // Expande o módulo após abrir o drawer
      setExpandedModules((prev) => ({
        ...prev,
        [moduleId]: true,
      }));
    } else {
      // Se já estiver aberto, apenas alterna o estado do módulo
      setExpandedModules((prev) => ({
        ...prev,
        [moduleId]: !prev[moduleId],
      }));
    }
  };

  const handleClickOutside = () => {
    if (drawerOpen) {
      setDrawerOpen(false);
    }
  };

  // Se não há usuário logado, não exibe o menu
  if (!user) {
    return null;
  }

  const renderMenuItem = (page: RouteConfig, isSubItem: boolean = false) => {
    const isActive = pathname === page.router;
    return (
      <ListItem key={page.text} disablePadding sx={{ pl: isSubItem ? 2 : 0 }}>
        <Tooltip title={!drawerOpen && !isSubItem ? page.text : ""} placement="right">
          <ListItemButton
            onClick={() => handleNavigateToPage(page.router)}
            sx={{
              minHeight: 48,
              justifyContent: drawerOpen ? "initial" : "center",
              px: 2.5,
              backgroundColor: "transparent",
              color: "inherit",
              borderRight: isActive ? "4px solid" : "4px solid transparent",
              borderColor: isActive ? "primary.dark" : "transparent",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
              "& .MuiListItemIcon-root": {
                color: "inherit",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: drawerOpen ? 3 : "auto",
                justifyContent: "center",
              }}
            >
              {page.icon}
            </ListItemIcon>
            {drawerOpen && (
              <ListItemText
                primary={page.text}
                primaryTypographyProps={{
                  fontWeight: isActive ? 700 : 400,
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </ListItem>
    );
  };

  const renderModuleMenu = (module: MenuModule) => {
    const moduleRoutes = getRoutesByModule(user.role, module.id);
    const isExpanded = expandedModules[module.id] || false;
    const hasActiveRoute = moduleRoutes.some((route) => pathname === route.router);

    return (
      <React.Fragment key={module.id}>
        <ListItem disablePadding>
          <Tooltip title={!drawerOpen ? module.text : ""} placement="right">
            <ListItemButton
              onClick={() => handleToggleModule(module.id)}
              sx={{
                minHeight: 48,
                justifyContent: drawerOpen ? "initial" : "center",
                px: 2.5,
                borderRight: hasActiveRoute ? "4px solid" : "4px solid transparent",
                borderColor: hasActiveRoute ? "primary.main" : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: drawerOpen ? 3 : "auto",
                  justifyContent: "center",
                  color: hasActiveRoute ? "primary.main" : "inherit",
                }}
              >
                {module.icon}
              </ListItemIcon>
              {drawerOpen && (
                <>
                  <ListItemText
                    primary={module.text}
                    primaryTypographyProps={{
                      fontWeight: hasActiveRoute ? 700 : 400,
                    }}
                  />
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>
        {drawerOpen && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {moduleRoutes.map((route) => renderMenuItem(route, true))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const renderMenuItemMobile = (page: RouteConfig, isSubItem: boolean = false) => {
    const isActive = pathname === page.router;
    return (
      <ListItem key={page.text} disablePadding sx={{ pl: isSubItem ? 2 : 0 }}>
        <ListItemButton
          onClick={() => handleNavigateToPage(page.router)}
          sx={{
            backgroundColor: "transparent",
            color: "inherit",
            borderRight: isActive ? "4px solid" : "4px solid transparent",
            borderColor: isActive ? "primary.dark" : "transparent",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
            "& .MuiListItemIcon-root": {
              color: "inherit",
            },
          }}
        >
          <ListItemIcon>{page.icon}</ListItemIcon>
          <ListItemText
            primary={page.text}
            primaryTypographyProps={{
              fontWeight: isActive ? 700 : 400,
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  const renderModuleMenuMobile = (module: MenuModule) => {
    const moduleRoutes = getRoutesByModule(user.role, module.id);
    const isExpanded = expandedModules[module.id] || false;
    const hasActiveRoute = moduleRoutes.some((route) => pathname === route.router);

    return (
      <React.Fragment key={module.id}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleToggleModule(module.id)}
            sx={{
              backgroundColor: "transparent",
              borderRight: hasActiveRoute ? "4px solid" : "4px solid transparent",
              borderColor: hasActiveRoute ? "primary.main" : "transparent",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: hasActiveRoute ? "primary.main" : "inherit",
              }}
            >
              {module.icon}
            </ListItemIcon>
            <ListItemText
              primary={module.text}
              primaryTypographyProps={{
                fontWeight: hasActiveRoute ? 700 : 400,
              }}
            />
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {moduleRoutes.map((route) => renderMenuItemMobile(route, true))}
          </List>
        </Collapse>
      </React.Fragment>
    );
  };

  return (
    <>
      {/* Overlay para fechar o drawer quando clicar fora - Desktop */}
      {drawerOpen && (
        <Box
          onClick={handleClickOutside}
          sx={{
            display: { xs: "none", md: "block" },
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "transparent",
            zIndex: (theme) => theme.zIndex.drawer - 1,
          }}
        />
      )}

      {/* Drawer para Desktop */}
      <Drawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerOpen ? DRAWER_WIDTH : DRAWER_WIDTH_CLOSED,
          flexShrink: 0,
          whiteSpace: "nowrap",
          boxSizing: "border-box",
          "& .MuiDrawer-paper": {
            width: drawerOpen ? DRAWER_WIDTH : DRAWER_WIDTH_CLOSED,
            boxSizing: "border-box",
            overflowX: "hidden",
            backgroundColor: "#f5f5f5",
            borderRight: "1px solid #e0e0e0",
            transition: (theme) =>
              theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: drawerOpen ? "space-between" : "center",
            padding: 2,
            minHeight: 64,
          }}
        >
          {drawerOpen && (
            <Typography variant="h6" fontWeight={700}>
              Menu
            </Typography>
          )}
          <IconButton onClick={drawerOpen ? handleDrawerClose : handleDrawerOpen}>
            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: "#e0e0e0" }} />
        <List>
          {routesWithoutModule.map((page) => renderMenuItem(page, false))}
          {modules.map((module) => renderModuleMenu(module))}
        </List>
      </Drawer>

      {/* Drawer para Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleMobileDrawerToggle}
        ModalProps={{
          keepMounted: true, // Melhor performance em mobile
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            backgroundColor: "#f5f5f5",
            borderRight: "1px solid #e0e0e0",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 2,
            minHeight: 64,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Menu
          </Typography>
          <IconButton onClick={handleMobileDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: "#e0e0e0" }} />
        <List>
          {routesWithoutModule.map((page) => renderMenuItemMobile(page, false))}
          {modules.map((module) => renderModuleMenuMobile(module))}
        </List>
      </Drawer>

      <AppBar
        position="fixed"
        color="default"
        sx={{
          marginLeft: { xs: 0, md: drawerOpen ? `${DRAWER_WIDTH}px` : `${DRAWER_WIDTH_CLOSED}px` },
          width: {
            xs: "100%",
            md: drawerOpen
              ? `calc(100% - ${DRAWER_WIDTH}px)`
              : `calc(100% - ${DRAWER_WIDTH_CLOSED}px)`,
          },
          borderBottom: "1px solid #e0e0e0",
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Botão de menu para mobile */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleMobileDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            <S.LinkLogo href="/">
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                Brain
              </Typography>
            </S.LinkLogo>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mr: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {user.email} ({user.role})
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 0, display: "flex", alignItems: "center", gap: 1 }}>
              <NotificationMenu />
              <Tooltip title="Configurações">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={user.email} src="/static/images/avatar/2.jpg">
                    {user.email.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem
                    key={setting.text}
                    onClick={() => handleNavigateToSetting(setting.router)}
                  >
                    <ListItemIcon>{setting.icon}</ListItemIcon>
                    <Typography>{setting.text}</Typography>
                  </MenuItem>
                ))}

                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography>Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
}
