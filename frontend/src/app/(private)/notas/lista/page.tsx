"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useNotas } from "@/hooks/useNotas";
import { UserRoleEnum } from "@/enums";
import { useNotaMutations } from "@/app/(private)/notas/useNotaMutations";
import { NotaListaResponse } from "@/services/domains/notas/response";
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

export default function NotaListaPage() {
  const router = useRouter();
  const { notas, loading, error } = useNotas();
  const { deleteNota } = useNotaMutations();

  // Estado para o modal de confirmação
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [notaToDelete, setNotaToDelete] = useState<{
    id: string;
    aluno: string;
  } | null>(null);

  const handleEditNota = (notaId: string) => {
    router.push(`/notas?id=${notaId}`);
  };

  const handleDeleteNota = (notaId: string, alunoNome: string) => {
    setNotaToDelete({ id: notaId, aluno: alunoNome });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (notaToDelete) {
      try {
        await deleteNota.mutateAsync(notaToDelete.id);
        setDeleteModalOpen(false);
        setNotaToDelete(null);
      } catch (error) {
        // O erro é tratado no hook useNotaMutations
        console.error("Erro ao deletar nota:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setNotaToDelete(null);
  };

  const handleNewNota = () => {
    router.push("/notas");
  };

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <PageTitle title="Notas" />
            <Typography variant="body2" color="text.secondary">
              Gerencie as notas dos alunos
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewNota}
            sx={{ height: "fit-content" }}
          >
            Nova Nota
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro ao carregar notas. Por favor, tente novamente.
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Aluno</TableCell>
                    <TableCell>Disciplina</TableCell>
                    <TableCell>Avaliação</TableCell>
                    <TableCell>Pontuação</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                          Nenhuma nota cadastrada
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    notas.map((nota: NotaListaResponse) => (
                      <TableRow key={nota.id} hover>
                        <TableCell>{nota.aluno}</TableCell>
                        <TableCell>{nota.disciplina}</TableCell>
                        <TableCell>{nota.avaliacao}</TableCell>
                        <TableCell>{nota.pontuacao}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditNota(nota.id.toString())}
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteNota(nota.id.toString(), nota.aluno)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Modal de Confirmação de Exclusão */}
        <Dialog
          open={deleteModalOpen}
          onClose={handleCancelDelete}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Tem certeza que deseja excluir a nota do aluno <strong>{notaToDelete?.aluno}</strong>?
              Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="primary">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deleteNota.isPending}
            >
              {deleteNota.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ProtectedRoute>
  );
}
