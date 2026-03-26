"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import PageTitle from "@/components/pageTitle/pageTitle";
import { UserRoleEnum } from "@/enums";
import { useUnidades } from "@/hooks/useUnidades";
import { useUnidadeMutations } from "@/app/(private)/unidade/useUnidadeMutations";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Container,
  Box,
  Button,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";

export default function ListaUnidadePage() {
  const router = useRouter();
  const { unidades, loading, error, refetch } = useUnidades();
  const { deleteUnidade } = useUnidadeMutations();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [unidadeToDelete, setUnidadeToDelete] = useState<{
    id: string;
    nome: string;
  } | null>(null);

  const handleEditUnidade = (unidadeId: string) => {
    router.push(`/unidade?id=${unidadeId}`);
  };

  const handleDeleteUnidade = (unidadeId: string, unidadeNome: string) => {
    setUnidadeToDelete({ id: unidadeId, nome: unidadeNome });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (unidadeToDelete) {
      try {
        await deleteUnidade.mutateAsync(unidadeToDelete.id);
        setDeleteModalOpen(false);
        setUnidadeToDelete(null);
      } catch (error) {
        console.error("Erro ao deletar unidade:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setUnidadeToDelete(null);
  };

  const handleNewUnidade = () => {
    router.push("/unidade");
  };

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.ADMIN, UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <PageTitle
              title="Lista de Unidades"
              description="Gerencie as unidades cadastradas no sistema"
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewUnidade}
            sx={{ height: "fit-content" }}
          >
            Nova Unidade
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
            <Table sx={{ minWidth: 650 }} aria-label="tabela de unidades">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Código</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unidades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Nenhuma unidade cadastrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  unidades.map((unidade) => (
                    <TableRow
                      key={unidade.id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {unidade.id}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {unidade.nome}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditUnidade(unidade.id.toString())}
                            sx={{ color: "primary.main" }}
                            title="Editar"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUnidade(unidade.id.toString(), unidade.nome)}
                            sx={{ color: "error.main" }}
                            title="Excluir"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Modal de confirmação para deletar unidade */}
        <Dialog
          open={deleteModalOpen}
          onClose={handleCancelDelete}
          aria-labelledby="delete-unidade-dialog-title"
          aria-describedby="delete-unidade-dialog-description"
        >
          <DialogTitle id="delete-unidade-dialog-title">Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-unidade-dialog-description">
              Tem certeza que deseja excluir a unidade <strong>{unidadeToDelete?.nome}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="inherit" disabled={deleteUnidade.isPending}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deleteUnidade.isPending}
              startIcon={deleteUnidade.isPending ? <CircularProgress size={16} /> : <Delete />}
            >
              {deleteUnidade.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ProtectedRoute>
  );
}
