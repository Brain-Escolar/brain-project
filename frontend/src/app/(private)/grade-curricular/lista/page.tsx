"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useGradesCurriculares } from "@/hooks/useGradesCurriculares";
import { UserRoleEnum } from "@/enums";
import { useGradeCurricularMutations } from "@/app/(private)/grade-curricular/useGradeCurricularMutations";
import { GradeCurricularListaResponse } from "@/services/domains/grade-curricular/response";
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

export default function ListaGradeCurricularPage() {
  const router = useRouter();
  const { gradesCurriculares, loading, error, refetch } = useGradesCurriculares();
  const { deleteGradeCurricular } = useGradeCurricularMutations();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState<{
    id: string;
    nome: string;
  } | null>(null);

  const handleEditGrade = (gradeId: string) => {
    router.push(`/grade-curricular?id=${gradeId}`);
  };

  const handleDeleteGrade = (gradeId: string, gradeNome: string) => {
    setGradeToDelete({ id: gradeId, nome: gradeNome });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (gradeToDelete) {
      try {
        await deleteGradeCurricular.mutateAsync(gradeToDelete.id);
        setDeleteModalOpen(false);
        setGradeToDelete(null);
      } catch (error) {
        console.error("Erro ao deletar grade curricular:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setGradeToDelete(null);
  };

  const handleNewGrade = () => {
    router.push("/grade-curricular");
  };

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <PageTitle
              title="Grades Curriculares"
              description="Gerencie as grades curriculares cadastradas no sistema"
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewGrade}
            sx={{ height: "fit-content" }}
          >
            Nova Grade
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
            <Table sx={{ minWidth: 650 }} aria-label="tabela de grades curriculares">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Versão</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Disciplinas</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Carga Horária</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gradesCurriculares.map((grade: GradeCurricularListaResponse) => (
                  <TableRow
                    key={grade.id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {grade.nome}
                      </Typography>
                    </TableCell>
                    <TableCell>v{grade.versao}</TableCell>
                    <TableCell>{grade.quantidadeDisciplinas}</TableCell>
                    <TableCell>{grade.cargaHorariaTotal}h</TableCell>
                    <TableCell>
                      <Chip
                        label={grade.ativo ? "Ativa" : "Inativa"}
                        size="small"
                        color={grade.ativo ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleEditGrade(grade.id.toString())}
                          sx={{ color: "primary.main" }}
                          title="Editar"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleDeleteGrade(grade.id.toString(), grade.nome)
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

        <Dialog
          open={deleteModalOpen}
          onClose={handleCancelDelete}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Tem certeza que deseja excluir a grade curricular{" "}
              <strong>{gradeToDelete?.nome}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCancelDelete}
              color="inherit"
              disabled={deleteGradeCurricular.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deleteGradeCurricular.isPending}
              startIcon={
                deleteGradeCurricular.isPending ? (
                  <CircularProgress size={16} />
                ) : (
                  <Delete />
                )
              }
            >
              {deleteGradeCurricular.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ProtectedRoute>
  );
}
