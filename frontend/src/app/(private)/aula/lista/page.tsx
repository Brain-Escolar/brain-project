"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useAulasLista } from "@/hooks/useAulasLista";
import { UserRoleEnum } from "@/enums";
import { useAulaMutations } from "@/app/(private)/aula/useAulaMutations";
import { AulaListaResponse } from "@/services/domains/aula/response";
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
import { Edit, Delete, Add } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import PageTitle from "@/components/pageTitle/pageTitle";

export default function ListaAulaPage() {
  const router = useRouter();
  const { aulas, loading, error, refetch } = useAulasLista();
  const { deleteAula } = useAulaMutations();

  // Estado para o modal de confirmação
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [aulaToDelete, setAulaToDelete] = useState<{
    id: string;
    disciplina: string;
  } | null>(null);

  const handleEditAula = (aulaId: string) => {
    router.push(`/aula?id=${aulaId}`);
  };

  const handleDeleteAula = (aulaId: string, disciplina: string) => {
    setAulaToDelete({ id: aulaId, disciplina });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (aulaToDelete) {
      try {
        await deleteAula.mutateAsync(aulaToDelete.id);
        setDeleteModalOpen(false);
        setAulaToDelete(null);
      } catch (error) {
        console.error("Erro ao deletar aula:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setAulaToDelete(null);
  };

  const handleNewAula = () => {
    router.push("/aula");
  };

  // Função para traduzir dia da semana
  const translateDiaSemana = (dia: string) => {
    const dias: Record<string, string> = {
      MONDAY: "Segunda-feira",
      TUESDAY: "Terça-feira",
      WEDNESDAY: "Quarta-feira",
      THURSDAY: "Quinta-feira",
      FRIDAY: "Sexta-feira",
      SATURDAY: "Sábado",
      SUNDAY: "Domingo",
    };
    return dias[dia] || dia;
  };

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <PageTitle
              title={"Lista de Aulas"}
              description="Gerencie as aulas cadastradas no sistema"
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewAula}
            sx={{ height: "fit-content" }}
          >
            Nova Aula
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
            <Table sx={{ minWidth: 650 }} aria-label="tabela de aulas">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Disciplina</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Turma</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Professor</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Dia da Semana</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Sala</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Horário</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {aulas.map((aula: AulaListaResponse) => (
                  <TableRow
                    key={aula.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {aula.disciplina}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{aula.turma}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{aula.professor}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={translateDiaSemana(aula.diaDaSemana)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{aula.sala}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{aula.horario}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditAula(aula.id.toString())}
                          sx={{ color: "primary.main" }}
                          title="Editar"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteAula(aula.id.toString(), aula.disciplina)}
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

        {/* Modal de confirmação para deletar aula */}
        <Dialog
          open={deleteModalOpen}
          onClose={handleCancelDelete}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Tem certeza que deseja excluir a aula de <strong>{aulaToDelete?.disciplina}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="inherit" disabled={deleteAula.isPending}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deleteAula.isPending}
              startIcon={deleteAula.isPending ? <CircularProgress size={16} /> : <Delete />}
            >
              {deleteAula.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ProtectedRoute>
  );
}
