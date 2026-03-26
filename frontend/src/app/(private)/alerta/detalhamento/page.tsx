"use client";

import { useState, useMemo } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import PageTitle from "@/components/pageTitle/pageTitle";
import { UserRoleEnum } from "@/enums";
import { useAlertas } from "@/hooks/useAlertas";
import { useAlertaMutations } from "@/app/(private)/alerta/useAlertaMutations";
import { AlertaResponse } from "@/services/domains/alerta";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Menu,
  MenuItem,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Check,
  CheckCircle,
  Delete,
  FilterList,
  Notifications,
  Campaign,
  Assignment,
  School,
  Schedule,
  Settings,
} from "@mui/icons-material";

type NotificationType = "assignment" | "grade" | "announcement" | "reminder" | "system";

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: NotificationType;
  read: boolean;
  link?: string;
}

const notificationTypeConfig = {
  assignment: {
    icon: Assignment,
    iconColor: "#FFFFFF" as const,
    bgColor: "#3B82F6" as const,
    label: "Tarefa",
  },
  grade: {
    icon: School,
    iconColor: "#FFFFFF" as const,
    bgColor: "#10B981" as const,
    label: "Nota",
  },
  announcement: {
    icon: Campaign,
    iconColor: "#7C3AED" as const,
    bgColor: "#F3E8FF" as const,
    label: "Anúncio",
  },
  reminder: {
    icon: Schedule,
    iconColor: "#FFFFFF" as const,
    bgColor: "#F59E0B" as const,
    label: "Lembrete",
  },
  system: {
    icon: Settings,
    iconColor: "#FFFFFF" as const,
    bgColor: "#6B7280" as const,
    label: "Sistema",
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} de ${month}. de ${year}`;
}

// Função para converter AlertaResponse para Notification
function mapAlertaToNotification(
  alerta: AlertaResponse,
  readStatus: Map<string, boolean>,
): Notification {
  const [year, month, day] = alerta.data;
  const date = new Date(year, month - 1, day).toISOString();

  // Por padrão, todos os alertas são do tipo "announcement" e não lidos
  // O status de leitura é gerenciado localmente
  return {
    id: alerta.id.toString(),
    title: alerta.titulo,
    message: alerta.conteudo,
    date,
    type: "announcement" as NotificationType,
    read: readStatus.get(alerta.id.toString()) ?? false,
  };
}

function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = notificationTypeConfig[notification.type];
  const IconComponent = config.icon;
  const formattedDate = formatDate(notification.date);

  return (
    <Card
      sx={{
        borderLeft: !notification.read ? "4px solid" : "none",
        borderLeftColor: !notification.read ? "#0A0A0A" : "transparent",
        bgcolor: !notification.read ? "#F7F7F6" : "background.paper",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.12)",
          borderColor: "#D1D5DB",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 2, flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                bgcolor: config.bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconComponent sx={{ color: config.iconColor, fontSize: 20 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5, flexWrap: "wrap" }}>
                <Typography variant="h6" component="h3" sx={{ fontSize: "18px", fontWeight: 600, m: 0 }}>
                  {notification.title}
                </Typography>
                {!notification.read && (
                  <Chip
                    label="Novo"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      bgcolor: "#0A0A0A",
                      borderRadius: "12px",
                      "& .MuiChip-label": {
                        px: 1.5,
                        py: 0,
                        color: "#FFFFFF",
                      },
                    }}
                  />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                {formattedDate}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.6 }}>
                {notification.message}
              </Typography>
              <Chip
                label={config.label}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: "0.7rem",
                  height: 24,
                  borderColor: "#E5E7EB",
                  color: "#6B7280",
                  bgcolor: "transparent",
                }}
              />
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0, alignItems: "flex-start", pt: 0.5 }}>
            {!notification.read && (
              <IconButton
                size="small"
                onClick={() => onMarkRead(notification.id)}
                title="Marcar como lida"
                sx={{
                  color: "#3B82F6",
                  "&:hover": {
                    bgcolor: "rgba(59, 130, 246, 0.1)",
                  },
                }}
              >
                <Check fontSize="small" />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={() => onDelete(notification.id)}
              title="Excluir"
              sx={{
                color: "#EF4444",
                "&:hover": {
                  bgcolor: "rgba(239, 68, 68, 0.1)",
                },
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function NotificationsPage() {
  const { alertas, loading, error, refetch } = useAlertas();
  const { deleteAlerta } = useAlertaMutations();
  const [activeTab, setActiveTab] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [alertaToDelete, setAlertaToDelete] = useState<string | null>(null);

  // Estado local para gerenciar quais alertas foram marcados como lidos
  const [readStatus, setReadStatus] = useState<Map<string, boolean>>(new Map());

  // Converter alertas da API para o formato Notification
  const notifications = useMemo(() => {
    return alertas.map((alerta) => mapAlertaToNotification(alerta, readStatus));
  }, [alertas, readStatus]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Função mockada para marcar como lido (apenas atualiza estado local)
  const handleMarkRead = (id: string) => {
    setReadStatus((prev) => {
      const newMap = new Map(prev);
      newMap.set(id, true);
      return newMap;
    });
  };

  const handleMarkAllRead = () => {
    setReadStatus((prev) => {
      const newMap = new Map(prev);
      notifications.forEach((n) => {
        if (!n.read) {
          newMap.set(n.id, true);
        }
      });
      return newMap;
    });
  };

  const handleDeleteClick = (id: string) => {
    setAlertaToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (alertaToDelete) {
      try {
        await deleteAlerta.mutateAsync(alertaToDelete);
        setDeleteDialogOpen(false);
        setAlertaToDelete(null);
      } catch (error) {
        console.error("Erro ao deletar alerta:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setAlertaToDelete(null);
  };

  const handleClearAll = async () => {
    // Deletar todos os alertas um por um
    const deletePromises = notifications.map((n) => deleteAlerta.mutateAsync(n.id));
    try {
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Erro ao deletar alertas:", error);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 1 && n.read) return false;
    if (typeFilter && n.type !== typeFilter) return false;
    return true;
  });

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterSelect = (type: string | null) => {
    setTypeFilter(type);
    handleFilterClose();
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={[UserRoleEnum.ADMIN, UserRoleEnum.PROFESSOR]}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={[UserRoleEnum.ADMIN, UserRoleEnum.PROFESSOR]}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Button onClick={() => refetch()} sx={{ ml: 2 }}>
              Tentar novamente
            </Button>
          </Alert>
        </Container>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.ADMIN, UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
          <Box>
            <PageTitle
              title="Notificações"
              description={`Você tem ${unreadCount} notificação${unreadCount !== 1 ? "ões" : ""} não lida${unreadCount !== 1 ? "s" : ""}`}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              size="medium"
              startIcon={<FilterList />}
              onClick={handleFilterClick}
              sx={{
                textTransform: "none",
                fontWeight: 400,
                borderColor: "#E5E7EB",
                color: "#374151",
                bgcolor: "#FFFFFF",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                "&:hover": {
                  borderColor: "#D1D5DB",
                  bgcolor: "#F9FAFB",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              {typeFilter
                ? notificationTypeConfig[typeFilter as keyof typeof notificationTypeConfig].label
                : "Todos os Tipos"}
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
            >
              <MenuItem onClick={() => handleFilterSelect(null)}>Todos os Tipos</MenuItem>
              {Object.entries(notificationTypeConfig).map(([key, config]) => {
                const IconComp = config.icon;
                return (
                  <MenuItem key={key} onClick={() => handleFilterSelect(key)}>
                    <IconComp sx={{ mr: 1, fontSize: 18 }} /> {config.label}
                  </MenuItem>
                );
              })}
            </Menu>
            <Button
              variant="outlined"
              size="medium"
              startIcon={<CheckCircle />}
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              sx={{
                textTransform: "none",
                fontWeight: 400,
                borderColor: "#E5E7EB",
                color: "#374151",
                bgcolor: "#FFFFFF",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                "&:hover": {
                  borderColor: "#D1D5DB",
                  bgcolor: "#F9FAFB",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                },
                "&:disabled": {
                  borderColor: "#E5E7EB",
                  color: "#9CA3AF",
                  bgcolor: "#FFFFFF",
                },
              }}
            >
              Marcar todas como lidas
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <ToggleButtonGroup
            value={activeTab}
            exclusive
            onChange={(_, newValue: number | null) => {
              if (newValue !== null) {
                setActiveTab(newValue);
              }
            }}
            sx={{
              bgcolor: "#E5E7EB",
              borderRadius: "8px",
              p: 0.5,
              gap: 0.5,
              "& .MuiToggleButton-root": {
                border: "none",
                borderRadius: "6px",
                px: 2,
                py: 1,
                textTransform: "none",
                fontWeight: 400,
                fontSize: "0.875rem",
                color: "#374151",
                "&.Mui-selected": {
                  bgcolor: "#FFFFFF",
                  color: "#111827",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                  "&:hover": {
                    bgcolor: "#FFFFFF",
                  },
                },
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.5)",
                },
              },
            }}
          >
            <ToggleButton value={0}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Notifications fontSize="small" />
                <Box component="span" sx={{ marginRight: 1 }}>Todas</Box>
                <Badge
                  badgeContent={notifications.length}
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: "#9CA3AF",
                      color: "white",
                      fontSize: "0.7rem",
                      minWidth: 18,
                      height: 18,
                      borderRadius: "6px",
                    },
                  }}
                />
              </Box>
            </ToggleButton>
            <ToggleButton value={1}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box component="span" sx={{ marginRight: 1 }}>Não lidas</Box>
                {unreadCount > 0 && (
                  <Badge
                    badgeContent={unreadCount}
                    sx={{
                      "& .MuiBadge-badge": {
                        bgcolor: "#EF4444",
                        color: "white",
                        fontSize: "0.7rem",
                        minWidth: 18,
                        height: 18,
                        borderRadius: "6px",
                      },
                    }}
                  />
                )}
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {filteredNotifications.length > 0 ? (
          <Stack spacing={3}>
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onDelete={handleDeleteClick}
              />
            ))}
          </Stack>
        ) : (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              {activeTab === 0 ? (
                <>
                  <Campaign sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Nenhuma notificação
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {typeFilter
                      ? `Nenhuma notificação do tipo ${notificationTypeConfig[typeFilter as keyof typeof notificationTypeConfig].label.toLowerCase()}`
                      : "Você está em dia!"}
                  </Typography>
                </>
              ) : (
                <>
                  <CheckCircle sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Tudo em dia!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Você não tem notificações não lidas
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {notifications.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 4, borderTop: 1, borderColor: "divider", mt: 4 }}>
            <Button
              variant="text"
              color="error"
              startIcon={<Delete />}
              onClick={handleClearAll}
              disabled={deleteAlerta.isPending}
              sx={{ textTransform: "none", fontWeight: 400 }}
            >
              {deleteAlerta.isPending ? "Excluindo..." : "Limpar todas as notificações"}
            </Button>
          </Box>
        )}

        {/* Dialog de confirmação para deletar */}
        <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza que deseja excluir esta notificação?
              <br />
              Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="inherit" disabled={deleteAlerta.isPending}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deleteAlerta.isPending}
              startIcon={deleteAlerta.isPending ? <CircularProgress size={16} /> : <Delete />}
            >
              {deleteAlerta.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ProtectedRoute>
  );
}
