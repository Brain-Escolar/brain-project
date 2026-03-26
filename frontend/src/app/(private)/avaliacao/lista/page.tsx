"use client";
import { useAvaliacaoMutations } from "@/app/(private)/avaliacao/useAvaliacaoMutations";
import PageTitle from "@/components/pageTitle/pageTitle";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { UserRoleEnum } from "@/enums";
import { useAvaliacoes } from "@/hooks/useAvaliacoes";
import { AvaliacaoListaResponse } from "@/services/domains/avaliacao/response";
import { Add, Delete, Edit } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AvaliacaoListaPage() {
  const router = useRouter();
  const { avaliacoes, loading, error } = useAvaliacoes();
  const { deleteAvaliacao } = useAvaliacaoMutations();

  // Estado para o modal de confirmação
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [avaliacaoToDelete, setAvaliacaoToDelete] = useState<{
    id: string;
    nome: string;
  } | null>(null);

  const handleEditAvaliacao = (avaliacaoId: string) => {
    router.push(`/avaliacao?id=${avaliacaoId}`);
  };

  const handleDeleteAvaliacao = (avaliacaoId: string, avaliacaoNome: string) => {
    setAvaliacaoToDelete({ id: avaliacaoId, nome: avaliacaoNome });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (avaliacaoToDelete) {
      try {
        await deleteAvaliacao.mutateAsync(avaliacaoToDelete.id);
        setDeleteModalOpen(false);
        setAvaliacaoToDelete(null);
      } catch (error) {
        // O erro é tratado no hook useAvaliacaoMutations
        console.error("Erro ao deletar avaliação:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setAvaliacaoToDelete(null);
  };

  const handleNewAvaliacao = () => {
    router.push("/avaliacao");
  };

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <PageTitle title="Avaliações" />
            <Typography variant="body2" color="text.secondary">
              Gerencie as avaliações do sistema
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewAvaliacao}
            sx={{ height: "fit-content" }}
          >
            Nova Avaliação
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro ao carregar avaliações. Por favor, tente novamente.
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
                    <TableCell>Nome</TableCell>
                    <TableCell>Disciplina</TableCell>
                    <TableCell>Peso</TableCell>
                    <TableCell>Conteúdo</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {avaliacoes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                          Nenhuma avaliação cadastrada
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    avaliacoes.map((avaliacao: AvaliacaoListaResponse) => (
                      <TableRow key={avaliacao.id} hover>
                        <TableCell>{avaliacao.nome}</TableCell>
                        <TableCell>{avaliacao.disciplina}</TableCell>
                        <TableCell>{avaliacao.peso}</TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {avaliacao.conteudo}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditAvaliacao(avaliacao.id.toString())}
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() =>
                              handleDeleteAvaliacao(avaliacao.id.toString(), avaliacao.nome)
                            }
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
              Tem certeza que deseja excluir a avaliação <strong>{avaliacaoToDelete?.nome}</strong>?
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
              disabled={deleteAvaliacao.isPending}
            >
              {deleteAvaliacao.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ProtectedRoute>
  );
}
