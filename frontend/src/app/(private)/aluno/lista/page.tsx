"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useAlunos } from "@/hooks/useAlunos";
import { UserRoleEnum } from "@/enums";
import { useAlunoMutations } from "@/app/(private)/aluno/useAlunoMutations";
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

export default function ListaAlunoPage() {
  const router = useRouter();
  const { alunos, loading, error, refetch } = useAlunos();
  const { deleteAluno } = useAlunoMutations();

  // Estado para o modal de confirmação
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [alunoToDelete, setAlunoToDelete] = useState<{
    id: string;
    nome: string;
  } | null>(null);

  const handleEditAluno = (alunoId: string) => {
    router.push(`/aluno?id=${alunoId}`);
  };

  const handleDeleteAluno = (alunoId: string, alunoNome: string) => {
    setAlunoToDelete({ id: alunoId, nome: alunoNome });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (alunoToDelete) {
      try {
        await deleteAluno.mutateAsync(alunoToDelete.id);
        setDeleteModalOpen(false);
        setAlunoToDelete(null);
      } catch (error) {
        // O erro é tratado no hook useAlunoMutations
        console.error("Erro ao deletar aluno:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setAlunoToDelete(null);
  };

  const handleNewAluno = () => {
    router.push("/aluno");
  };

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.ADMIN, UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <PageTitle
              title={"Lista de Alunos"}
              description="Gerencie os alunos cadastrados no sistema"
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewAluno}
            sx={{ height: "fit-content" }}
          >
            Novo Aluno
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
            <Table sx={{ minWidth: 650 }} aria-label="tabela de alunos">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Matrícula</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>CPF</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>E-mail</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>E-mail Escolar</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alunos.map((aluno) => (
                  <TableRow
                    key={aluno.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {aluno.matricula}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {aluno.nome}
                        </Typography>
                        {aluno.nomeSocial && (
                          <Typography variant="caption" color="text.secondary">
                            {aluno.nomeSocial}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{aluno.cpf}</TableCell>
                    <TableCell>{aluno.email}</TableCell>
                    <TableCell>{aluno.emailEscolar}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditAluno(aluno.id.toString())}
                          sx={{ color: "primary.main" }}
                          title="Editar"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteAluno(aluno.id.toString(), aluno.nome)}
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

        {/* Modal de confirmação para deletar aluno */}
        <Dialog
          open={deleteModalOpen}
          onClose={handleCancelDelete}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Tem certeza que deseja excluir o aluno <strong>{alunoToDelete?.nome}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="inherit" disabled={deleteAluno.isPending}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deleteAluno.isPending}
              startIcon={deleteAluno.isPending ? <CircularProgress size={16} /> : <Delete />}
            >
              {deleteAluno.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ProtectedRoute>
  );
}
