"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { UserRoleEnum } from "@/enums";
import { useDisciplinaMutations } from "@/app/(private)/disciplina/useDisciplinaMutations";
import { DisciplinaListaResponse } from "@/services/domains/disciplina/response";
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
import { Edit, Delete, Add } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import PageTitle from "@/components/pageTitle/pageTitle";

export default function DisciplinaPage() {
  const router = useRouter();
  const { disciplinas, loading, error, refetch } = useDisciplinas();
  const { deleteDisciplina } = useDisciplinaMutations();

  // Estado para o modal de confirmação
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [disciplinaToDelete, setDisciplinaToDelete] = useState<{
    id: string;
    nome: string;
  } | null>(null);

  const handleEditDisciplina = (disciplinaId: string) => {
    router.push(`/disciplina?id=${disciplinaId}`);
  };

  const handleDeleteDisciplina = (disciplinaId: string, disciplinaNome: string) => {
    setDisciplinaToDelete({ id: disciplinaId, nome: disciplinaNome });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (disciplinaToDelete) {
      try {
        await deleteDisciplina.mutateAsync(disciplinaToDelete.id);
        setDeleteModalOpen(false);
        setDisciplinaToDelete(null);
      } catch (error) {
        // O erro é tratado no hook useDisciplinaMutations
        console.error("Erro ao deletar disciplina:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setDisciplinaToDelete(null);
  };

  const handleNewDisciplina = () => {
    router.push("/disciplina");
  };

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <PageTitle
              title={"Lista de Disciplinas"}
              description="Gerencie as disciplinas cadastradas no sistema"
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewDisciplina}
            sx={{ height: "fit-content" }}
          >
            Nova Disciplina
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
            <Table sx={{ minWidth: 650 }} aria-label="tabela de disciplinas">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Unidade</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Série</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Grupo</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Carga Horária</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {disciplinas.map((disciplina: DisciplinaListaResponse) => (
                  <TableRow
                    key={disciplina.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {disciplina.nome}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {disciplina.unidade}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {disciplina.serie}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {disciplina.grupo}
                      </Typography>
                    </TableCell>
                    <TableCell>{disciplina.cargaHoraria}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditDisciplina(disciplina.id.toString())}
                          sx={{ color: "primary.main" }}
                          title="Editar"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleDeleteDisciplina(disciplina.id.toString(), disciplina.nome)
                          }
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

        {/* Modal de confirmação para deletar disciplina */}
        <Dialog
          open={deleteModalOpen}
          onClose={handleCancelDelete}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Tem certeza que deseja excluir a disciplina{" "}
              <strong>{disciplinaToDelete?.nome}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCancelDelete}
              color="inherit"
              disabled={deleteDisciplina.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deleteDisciplina.isPending}
              startIcon={deleteDisciplina.isPending ? <CircularProgress size={16} /> : <Delete />}
            >
              {deleteDisciplina.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ProtectedRoute>
  );
}
