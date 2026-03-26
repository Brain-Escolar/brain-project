"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useProfessores } from "@/hooks/useProfessores";
import { UserRoleEnum } from "@/enums";
import { useProfessorMutations } from "@/app/(private)/professor/useProfessorMutations";
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

export default function ProfessorPage() {
  const router = useRouter();
  const { professores, loading, error, refetch } = useProfessores();
  const { deleteProfessor } = useProfessorMutations();

  // Estado para o modal de confirmação
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [professorToDelete, setProfessorToDelete] = useState<{
    id: string;
    nome: string;
  } | null>(null);

  const handleEditProfessor = (professorId: string) => {
    router.push(`/professor?id=${professorId}`);
  };

  const handleDeleteProfessor = (professorId: string, professorNome: string) => {
    setProfessorToDelete({ id: professorId, nome: professorNome });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (professorToDelete) {
      try {
        await deleteProfessor.mutateAsync(professorToDelete.id);
        setDeleteModalOpen(false);
        setProfessorToDelete(null);
      } catch (error) {
        // O erro é tratado no hook useProfessorMutations
        console.error("Erro ao deletar professor:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setProfessorToDelete(null);
  };

  const handleNewProfessor = () => {
    router.push("/professor");
  };

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <PageTitle
              title={"Lista de Professores"}
              description="Gerencie os professores cadastrados no sistema"
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewProfessor}
            sx={{ height: "fit-content" }}
          >
            Novo Professor
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
            <Table sx={{ minWidth: 650 }} aria-label="tabela de professores">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Matrícula</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>CPF</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>E-mail</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>E-mail Profissional</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {professores.map((professor) => (
                  <TableRow
                    key={professor.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {professor.matricula}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {professor.nome}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {professor.nomeSocial}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{professor.cpf}</TableCell>
                    <TableCell>{professor.email}</TableCell>
                    <TableCell>{professor.emailProfissional}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditProfessor(professor.id.toString())}
                          sx={{ color: "primary.main" }}
                          title="Editar"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleDeleteProfessor(professor.id.toString(), professor.nome)
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

        {/* Modal de confirmação para deletar professor */}
        <Dialog
          open={deleteModalOpen}
          onClose={handleCancelDelete}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Tem certeza que deseja excluir o professor <strong>{professorToDelete?.nome}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCancelDelete}
              color="inherit"
              disabled={deleteProfessor.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deleteProfessor.isPending}
              startIcon={deleteProfessor.isPending ? <CircularProgress size={16} /> : <Delete />}
            >
              {deleteProfessor.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ProtectedRoute>
  );
}
