"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useGruposDisciplina } from "@/hooks/useGruposDisciplina";
import { UserRoleEnum } from "@/enums";
import { useGrupoDisciplinaMutations } from "@/app/(private)/grupo-disciplina/useGrupoDisciplinaMutations";
import { GrupoDisciplinaListaResponse } from "@/services/domains/grupo-disciplina/response";
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

export default function ListaGrupoDisciplinaPage() {
  const router = useRouter();
  const { gruposDisciplina, loading, error, refetch } = useGruposDisciplina();
  const { deleteGrupoDisciplina } = useGrupoDisciplinaMutations();

  // Estado para o modal de confirmação
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [grupoDisciplinaToDelete, setGrupoDisciplinaToDelete] = useState<{
    id: string;
    nome: string;
  } | null>(null);

  const handleEditGrupoDisciplina = (grupoDisciplinaId: string) => {
    router.push(`/grupo-disciplina?id=${grupoDisciplinaId}`);
  };

  const handleDeleteGrupoDisciplina = (grupoDisciplinaId: string, grupoDisciplinaNome: string) => {
    setGrupoDisciplinaToDelete({ id: grupoDisciplinaId, nome: grupoDisciplinaNome });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (grupoDisciplinaToDelete) {
      try {
        await deleteGrupoDisciplina.mutateAsync(grupoDisciplinaToDelete.id);
        setDeleteModalOpen(false);
        setGrupoDisciplinaToDelete(null);
      } catch (error) {
        // O erro é tratado no hook useGrupoDisciplinaMutations
        console.error("Erro ao deletar grupo de disciplina:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setGrupoDisciplinaToDelete(null);
  };

  const handleNewGrupoDisciplina = () => {
    router.push("/grupo-disciplina");
  };

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <PageTitle
              title={"Lista de Grupos de Disciplina"}
              description="Gerencie os grupos de disciplina cadastrados no sistema"
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewGrupoDisciplina}
            sx={{ height: "fit-content" }}
          >
            Novo Grupo
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
            <Table sx={{ minWidth: 650 }} aria-label="tabela de grupos de disciplina">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Área</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gruposDisciplina.map((grupoDisciplina: GrupoDisciplinaListaResponse) => (
                  <TableRow
                    key={grupoDisciplina.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {grupoDisciplina.nome}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {grupoDisciplina.area}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditGrupoDisciplina(grupoDisciplina.id.toString())}
                          sx={{ color: "primary.main" }}
                          title="Editar"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleDeleteGrupoDisciplina(
                              grupoDisciplina.id.toString(),
                              grupoDisciplina.nome,
                            )
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

        {/* Modal de confirmação para deletar grupo de disciplina */}
        <Dialog
          open={deleteModalOpen}
          onClose={handleCancelDelete}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Tem certeza que deseja excluir o grupo de disciplina{" "}
              <strong>{grupoDisciplinaToDelete?.nome}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCancelDelete}
              color="inherit"
              disabled={deleteGrupoDisciplina.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deleteGrupoDisciplina.isPending}
              startIcon={
                deleteGrupoDisciplina.isPending ? <CircularProgress size={16} /> : <Delete />
              }
            >
              {deleteGrupoDisciplina.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ProtectedRoute>
  );
}
