"use client";
import { RoutesEnum } from "@/enums";
import { useSecretarios } from "@/hooks/useSecretarios";
import { useSecretarioMutations } from "@/app/(private)/secretario/useSecretarioMutations";
import { useState } from "react";
import {
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
import { Delete, Add } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import PageScaffold from "@/components/pageScaffold/PageScaffold";

export default function SecretarioListaPage() {
  const router = useRouter();
  const { secretarios, loading, error, refetch } = useSecretarios();
  const { deleteSecretario } = useSecretarioMutations();

  // Estado para o modal de confirmação
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [secretarioToDelete, setSecretarioToDelete] = useState<{
    id: string;
    nome: string;
  } | null>(null);

  const handleDeleteSecretario = (secretarioId: string, secretarioNome: string) => {
    setSecretarioToDelete({ id: secretarioId, nome: secretarioNome });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (secretarioToDelete) {
      try {
        await deleteSecretario.mutateAsync(secretarioToDelete.id);
        setDeleteModalOpen(false);
        setSecretarioToDelete(null);
      } catch (error) {
        // O erro é tratado no hook useSecretarioMutations
        console.error("Erro ao deletar secretário:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setSecretarioToDelete(null);
  };

  const handleNewSecretario = () => {
    router.push(RoutesEnum.SECRETARIO_CADASTRO);
  };

  return (
    <PageScaffold
      title="Lista de Secretários"
      description="Gerencie os secretários cadastrados no sistema"
      actions={
        <Button variant="contained" startIcon={<Add />} onClick={handleNewSecretario} sx={{ height: "fit-content" }}>
          Novo Secretário
        </Button>
      }
    >
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
          <Table sx={{ minWidth: 650 }} aria-label="tabela de secretários">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>CPF</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>E-mail</TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {secretarios.map((secretario) => (
                <TableRow
                  key={secretario.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {secretario.nome}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {secretario.nomeSocial}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{secretario.cpf}</TableCell>
                  <TableCell>{secretario.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleDeleteSecretario(secretario.id.toString(), secretario.nome)
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

      {/* Modal de confirmação para deletar secretário */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Tem certeza que deseja excluir o secretário <strong>{secretarioToDelete?.nome}</strong>?
            <br />
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            color="inherit"
            disabled={deleteSecretario.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteSecretario.isPending}
            startIcon={deleteSecretario.isPending ? <CircularProgress size={16} /> : <Delete />}
          >
            {deleteSecretario.isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageScaffold>
  );
}
