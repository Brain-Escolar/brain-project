"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useTarefas } from "@/hooks/useTarefas";
import { RoutesEnum, UserRoleEnum } from "@/enums";
import { useTarefaMutations } from "@/app/(private)/tarefa/useTarefaMutations";
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
import { Edit, Delete, Add, Description } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import PageTitle from "@/components/pageTitle/pageTitle";

export default function ListaTarefaPage() {
  const router = useRouter();
  const { tarefas, loading, error, refetch } = useTarefas();
  const { deleteTarefa } = useTarefaMutations();

  // Estado para o modal de confirmação
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tarefaToDelete, setTarefaToDelete] = useState<{
    id: string;
    titulo: string;
  } | null>(null);

  const handleEditTarefa = (tarefaId: string) => {
    router.push(`${RoutesEnum.TAREFA}?id=${tarefaId}`);
  };

  const handleDeleteTarefa = (tarefaId: string, tarefaTitulo: string) => {
    setTarefaToDelete({ id: tarefaId, titulo: tarefaTitulo });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (tarefaToDelete) {
      try {
        await deleteTarefa.mutateAsync(tarefaToDelete.id);
        setDeleteModalOpen(false);
        setTarefaToDelete(null);
      } catch (error) {
        // O erro é tratado no hook useTarefaMutations
        console.error("Erro ao deletar tarefa:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setTarefaToDelete(null);
  };

  const handleNewTarefa = () => {
    router.push(RoutesEnum.TAREFA);
  };

  // Função para formatar a data do array [ano, mês, dia] para dd/mm/aaaa
  const formatDate = (dateArray: number[]): string => {
    if (!dateArray || dateArray.length < 3) return "-";
    const [year, month, day] = dateArray;
    const dayStr = String(day).padStart(2, "0");
    const monthStr = String(month).padStart(2, "0");
    return `${dayStr}/${monthStr}/${year}`;
  };

  // Função para verificar se o prazo está vencido
  const isPrazoVencido = (dateArray: number[]): boolean => {
    if (!dateArray || dateArray.length < 3) return false;
    const [year, month, day] = dateArray;
    const prazoDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prazoDate < today;
  };

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.ADMIN, UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <PageTitle
              title={"Lista de Tarefas"}
              description="Gerencie as tarefas cadastradas no sistema"
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewTarefa}
            sx={{ height: "fit-content" }}
          >
            Nova Tarefa
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

        {!loading && !error && tarefas.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Description sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhuma tarefa cadastrada
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Comece criando uma nova tarefa para seus alunos
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={handleNewTarefa}>
              Criar Primeira Tarefa
            </Button>
          </Box>
        )}

        {!loading && !error && tarefas.length > 0 && (
          <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
            <Table sx={{ minWidth: 650 }} aria-label="tabela de tarefas">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Título</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Professor</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Prazo</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Documento</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tarefas.map((tarefa) => (
                  <TableRow
                    key={tarefa.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {tarefa.titulo}
                        </Typography>
                        {tarefa.conteudo && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {tarefa.conteudo}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{tarefa.professor || "-"}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {formatDate(tarefa.prazo)}
                        {isPrazoVencido(tarefa.prazo) && (
                          <Chip label="Vencido" size="small" color="error" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {tarefa.documentoUrl ? (
                        <Button
                          size="small"
                          href={tarefa.documentoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<Description />}
                        >
                          Ver documento
                        </Button>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditTarefa(tarefa.id.toString())}
                          sx={{ color: "primary.main" }}
                          title="Editar"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTarefa(tarefa.id.toString(), tarefa.titulo)}
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

        {/* Modal de confirmação para deletar tarefa */}
        <Dialog
          open={deleteModalOpen}
          onClose={handleCancelDelete}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Tem certeza que deseja excluir a tarefa <strong>{tarefaToDelete?.titulo}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="inherit" disabled={deleteTarefa.isPending}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deleteTarefa.isPending}
              startIcon={deleteTarefa.isPending ? <CircularProgress size={16} /> : <Delete />}
            >
              {deleteTarefa.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ProtectedRoute>
  );
}
