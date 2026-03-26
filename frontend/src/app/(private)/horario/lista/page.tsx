"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useHorarios } from "@/hooks/useHorarios";
import { UserRoleEnum } from "@/enums";
import { useHorarioMutations } from "@/app/(private)/horario/useHorarioMutations";
import { HorarioListaResponse } from "@/services/domains/horario/response";
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
  Chip,
} from "@mui/material";
import { Edit, Delete, Add, Schedule } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import PageTitle from "@/components/pageTitle/pageTitle";

export default function ListaHorarioPage() {
  const router = useRouter();
  const { horarios, loading, error, refetch } = useHorarios();
  const { deleteHorario } = useHorarioMutations();

  // Estado para o modal de confirmação
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [horarioToDelete, setHorarioToDelete] = useState<{
    id: string;
    nome: string;
  } | null>(null);

  const handleEditHorario = (horarioId: string) => {
    router.push(`/horario?id=${horarioId}`);
  };

  const handleDeleteHorario = (horarioId: string, horarioNome: string) => {
    setHorarioToDelete({ id: horarioId, nome: horarioNome });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (horarioToDelete) {
      try {
        await deleteHorario.mutateAsync(horarioToDelete.id);
        setDeleteModalOpen(false);
        setHorarioToDelete(null);
      } catch (error) {
        console.error("Erro ao deletar horário:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setHorarioToDelete(null);
  };

  const handleNewHorario = () => {
    router.push("/horario");
  };

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <PageTitle
              title={"Lista de Horários"}
              description="Gerencie os horários cadastrados no sistema"
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewHorario}
            sx={{ height: "fit-content" }}
          >
            Novo Horário
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

        {!loading && !error && (
          <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
            <Table sx={{ minWidth: 650 }} aria-label="tabela de horários">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Horário de Início</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Horário de Fim</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Duração</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {horarios.map((horario: HorarioListaResponse) => {
                  // Calcular duração
                  const [inicioHora, inicioMin] = horario.horarioInicio.split(":").map(Number);
                  const [fimHora, fimMin] = horario.horarioFim.split(":").map(Number);
                  const duracaoMinutos = fimHora * 60 + fimMin - (inicioHora * 60 + inicioMin);
                  const duracaoHoras = Math.floor(duracaoMinutos / 60);
                  const duracaoMin = duracaoMinutos % 60;
                  const duracaoTexto =
                    duracaoHoras > 0 ? `${duracaoHoras}h ${duracaoMin}min` : `${duracaoMin}min`;

                  return (
                    <TableRow
                      key={horario.id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {horario.nome}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Schedule fontSize="small" color="action" />
                          <Typography variant="body2">{horario.horarioInicio}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Schedule fontSize="small" color="action" />
                          <Typography variant="body2">{horario.horarioFim}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={duracaoTexto} size="small" color="info" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditHorario(horario.id.toString())}
                            sx={{ color: "primary.main" }}
                            title="Editar"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteHorario(horario.id.toString(), horario.nome)}
                            sx={{ color: "error.main" }}
                            title="Excluir"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Modal de confirmação para deletar horário */}
        <Dialog
          open={deleteModalOpen}
          onClose={handleCancelDelete}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Tem certeza que deseja excluir o horário <strong>{horarioToDelete?.nome}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="inherit" disabled={deleteHorario.isPending}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deleteHorario.isPending}
              startIcon={deleteHorario.isPending ? <CircularProgress size={16} /> : <Delete />}
            >
              {deleteHorario.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ProtectedRoute>
  );
}
