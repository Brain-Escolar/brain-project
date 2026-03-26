"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Box,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoIcon from "@mui/icons-material/Info";
import CheckIcon from "@mui/icons-material/Check";
import { RoutesEnum } from "@/enums";
import { useAlertas } from "@/hooks/useAlertas";
import { groupAlertasByDate, formatGroupTimeLabel, GROUP_LABELS, type DateGroupKey } from "./utils";

export function NotificationMenu() {
  const router = useRouter();
  const { alertas } = useAlertas();

  const [readNotificationIds, setReadNotificationIds] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const unreadCount = alertas?.filter((a) => !readNotificationIds.has(a.id.toString())).length ?? 0;

  const groupedAlertas = React.useMemo(
    () => (alertas?.length ? groupAlertasByDate(alertas) : null),
    [alertas],
  );

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = () => {
    setReadNotificationIds((prev) => {
      const next = new Set(prev);
      alertas?.forEach((a) => next.add(a.id.toString()));
      return next;
    });
  };

  const handleNotificationClick = (id: string) => {
    setReadNotificationIds((prev) => new Set(prev).add(id));
    handleClose();
    router.push(RoutesEnum.ALERTA_DETALHAMENTO);
  };

  return (
    <>
      <Tooltip title="Notificações">
        <IconButton
          onClick={handleOpen}
          sx={{ color: "inherit" }}
          aria-controls={anchorEl ? "menu-notificacoes" : undefined}
          aria-haspopup="true"
          aria-expanded={anchorEl ? "true" : undefined}
        >
          {unreadCount > 0 ? (
            <Badge
              badgeContent={unreadCount}
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  bgcolor: "#EF4444",
                  color: "white",
                  fontSize: "0.7rem",
                  minWidth: 18,
                  height: 18,
                },
              }}
            >
              <NotificationsIcon />
            </Badge>
          ) : (
            <NotificationsIcon />
          )}
        </IconButton>
      </Tooltip>
      <Menu
        id="menu-notificacoes"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              minWidth: 360,
              maxWidth: 360,
              maxHeight: 440,
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              borderRadius: 2,
            },
          },
          list: {
            disablePadding: true,
            sx: { py: 0 },
          },
        }}
      >
        <Paper elevation={0} sx={{ overflow: "hidden" }}>
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Notificações
            </Typography>
            <Typography
              component="button"
              variant="caption"
              onClick={handleMarkAllRead}
              sx={{
                color: "primary.main",
                cursor: "pointer",
                border: "none",
                background: "none",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontWeight: 600,
              }}
            >
              <CheckIcon sx={{ fontSize: 16 }} />
              MARCAR TUDO COMO LIDO
            </Typography>
          </Box>
          <Box sx={{ maxHeight: 360, overflow: "auto" }}>
            {alertas?.length ? (
              <>
                {(["hoje", "ontem", "antes"] as const).map((groupKey: DateGroupKey) => {
                  const items = groupedAlertas?.[groupKey] ?? [];
                  if (!items.length) return null;
                  return (
                    <Box key={groupKey}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ px: 2, py: 1, display: "block" }}
                      >
                        {GROUP_LABELS[groupKey]}
                      </Typography>
                      {items.map((alerta) => {
                        const isUnread = !readNotificationIds.has(alerta.id.toString());
                        return (
                          <ListItemButton
                            key={alerta.id}
                            onClick={() => handleNotificationClick(alerta.id.toString())}
                            sx={{
                              py: 1.5,
                              px: 2,
                              bgcolor: isUnread ? "rgba(255, 152, 0, 0.08)" : "transparent",
                              borderLeft: isUnread ? "3px solid" : "3px solid transparent",
                              borderLeftColor: isUnread ? "#FF9800" : "transparent",
                              "&:hover": {
                                bgcolor: isUnread ? "rgba(255, 152, 0, 0.12)" : "action.hover",
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              {isUnread ? (
                                <WarningAmberIcon sx={{ color: "#FF9800", fontSize: 22 }} />
                              ) : (
                                <InfoIcon sx={{ color: "info.main", fontSize: 22 }} />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body2"
                                  fontWeight={isUnread ? 600 : 400}
                                  noWrap
                                >
                                  {alerta.titulo || "{Title}"}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  {formatGroupTimeLabel(alerta)}
                                </Typography>
                              }
                            />
                            {isUnread && (
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  bgcolor: "#FF9800",
                                  flexShrink: 0,
                                  ml: 0.5,
                                }}
                              />
                            )}
                          </ListItemButton>
                        );
                      })}
                    </Box>
                  );
                })}
              </>
            ) : (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma notificação
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Menu>
    </>
  );
}
