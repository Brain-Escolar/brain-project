"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useAlertas } from "@/hooks/useAlertas";
import { RoutesEnum, UserRoleEnum } from "@/enums";
import { useAlertaMutations } from "@/app/(private)/alerta/useAlertaMutations";
import { useState } from "react";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Edit, Delete, Add, Campaign } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import PageTitle from "@/components/pageTitle/pageTitle";

export default function ListaAlertaPage() {
  const router = useRouter();
  const { alertas, loading, error, refetch } = useAlertas();
  const { deleteAlerta } = useAlertaMutations();

  // Estado para o modal de confirmação
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [alertaToDelete, setAlertaToDelete] = useState<{
    id: string;
    titulo: string;
  } | null>(null);

  const handleEditAlerta = (alertaId: string) => {
    router.push(`${RoutesEnum.ALERTA}?id=${alertaId}`);
  };

  const handleDeleteAlerta = (alertaId: string, alertaTitulo: string) => {
    setAlertaToDelete({ id: alertaId, titulo: alertaTitulo });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (alertaToDelete) {
      try {
        await deleteAlerta.mutateAsync(alertaToDelete.id);
        setDeleteModalOpen(false);
        setAlertaToDelete(null);
      } catch (error) {
        // O erro é tratado no hook useAlertaMutations
        console.error("Erro ao deletar alerta:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setAlertaToDelete(null);
  };

  const handleNewAlerta = () => {
    router.push(RoutesEnum.ALERTA);
  };

  // Função para formatar a data do array [ano, mês, dia] para dd/mm/aaaa
  const formatDate = (dateArray: number[]): string => {
    if (!dateArray || dateArray.length < 3) return "-";
    const [year, month, day] = dateArray;
    const dayStr = String(day).padStart(2, "0");
    const monthStr = String(month).padStart(2, "0");
    return `${dayStr}/${monthStr}/${year}`;
  };

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.ADMIN, UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <PageTitle
              title={"Lista de Alertas"}
              description="Gerencie os alertas cadastrados no sistema"
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewAlerta}
            sx={{ height: "fit-content" }}
          >
            Novo Alerta
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Button onClick={() => refetch()} sx={{ ml: 2 }}>
              Tentar novamente
            </Button>
          </Alert>
        )}

        {!loading && !error && alertas.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Campaign sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum alerta cadastrado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Comece criando um novo alerta para comunicar informações importantes
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={handleNewAlerta}>
              Criar Primeiro Alerta
            </Button>
          </Box>
        )}

        {!loading && !error && alertas.length > 0 && (
          <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
            <Table sx={{ minWidth: 650 }} aria-label="tabela de alertas">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Título</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Conteúdo</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Data de Publicação</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alertas.map((alerta) => (
                  <TableRow
                    key={alerta.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {alerta.titulo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 400,
                        }}
                      >
                        {alerta.conteudo}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(alerta.data)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditAlerta(alerta.id.toString())}
                          sx={{ color: "primary.main" }}
                          title="Editar"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteAlerta(alerta.id.toString(), alerta.titulo)}
                          sx={{ color: "error.main" }}
                          title="Excluir"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Modal de confirmação para deletar alerta */}
        <Dialog
          open={deleteModalOpen}
          onClose={handleCancelDelete}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Tem certeza que deseja excluir o alerta <strong>{alertaToDelete?.titulo}</strong>?
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
