"use client";
import { useState } from "react";
import PageTitle from "@/components/pageTitle/pageTitle";
import LayoutColumns from "@/components/layoutColumns/layoutColumns";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import { BrainDateTextControlled } from "@/components/brainForms/brainDateTextControlled";
import { useBrainForm } from "@/hooks/useBrainForm";
import { useComunicados } from "@/hooks/useComunicados";
import { useComunicadoMutations } from "@/hooks/useComunicadoMutations";
import { useAuth } from "@/hooks/useAuth";
import { UserRoleEnum } from "@/enums/UserRoleEnum";
import { ComunicadoListResponse } from "@/services/domains/comunicado/response";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Stack,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { z } from "zod";

const comunicadoSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  conteudo: z.string().min(1, "Conteúdo é obrigatório"),
  data: z
    .string()
    .min(10, "Data é obrigatória")
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: dd/mm/aaaa"),
});

type ComunicadoFormData = z.infer<typeof comunicadoSchema>;

function formatDateToApi(date: string): string {
  const [day, month, year] = date.split("/");
  return `${year}-${month}-${day}`;
}

function formatDateFromApi(date: string): string {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

export default function ComunicadosPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRoleEnum.ADMIN;

  const [page, setPage] = useState(1);
  const { comunicados, totalPages, totalElements, loading, error } = useComunicados(page - 1);

  const { createComunicado, updateComunicado, deleteComunicado } = useComunicadoMutations();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingComunicado, setEditingComunicado] = useState<ComunicadoListResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { control, handleSubmit, reset } = useBrainForm<ComunicadoFormData>({
    schema: comunicadoSchema,
    defaultValues: { titulo: "", conteudo: "", data: "" },
  });

  function handleOpenCreate() {
    setEditingComunicado(null);
    reset({ titulo: "", conteudo: "", data: "" });
    setModalOpen(true);
  }

  function handleOpenEdit(comunicado: ComunicadoListResponse) {
    setEditingComunicado(comunicado);
    reset({
      titulo: comunicado.titulo,
      conteudo: comunicado.conteudo,
      data: formatDateFromApi(comunicado.data),
    });
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setEditingComunicado(null);
    reset({ titulo: "", conteudo: "", data: "" });
  }

  function handleOpenDelete(id: number) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  const onSubmit = handleSubmit(async (data: ComunicadoFormData) => {
    const apiData = {
      titulo: data.titulo,
      conteudo: data.conteudo,
      data: formatDateToApi(data.data),
    };
    if (editingComunicado) {
      await updateComunicado.mutateAsync({ id: editingComunicado.id, ...apiData });
    } else {
      await createComunicado.mutateAsync(apiData);
    }
    handleCloseModal();
  });

  async function handleConfirmDelete() {
    if (deletingId !== null) {
      await deleteComunicado.mutateAsync(deletingId);
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <PageTitle title="Comunicados" />
        {isAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Novo Comunicado
          </Button>
        )}
      </Box>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Acompanhe atualizações e comunicados importantes da escola
      </Typography>

      <LayoutColumns sizeLeft="70%" sizeRight="30%">
        {/* Lista de comunicados */}
        <Box>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && (
            <>
              <Stack spacing={3}>
                {comunicados.map((comunicado) => (
                  <Card key={comunicado.id}>
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Typography variant="h5" component="h2">
                          {comunicado.titulo}
                        </Typography>
                        {isAdmin && (
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(comunicado)}
                              title="Editar comunicado"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDelete(comunicado.id)}
                              title="Excluir comunicado"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary" paragraph>
                        {comunicado.conteudo}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {formatDateFromApi(comunicado.data)}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}

                {comunicados.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ py: 6 }}
                  >
                    Nenhum comunicado encontrado.
                  </Typography>
                )}
              </Stack>

              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Visão geral - Seção lateral */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Visão geral
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Resumo de todos os comunicados
          </Typography>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Stack spacing={2}>
                <Box
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Total de comunicados
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {loading ? "..." : totalElements}
                  </Typography>
                </Box>

                <Divider />

                <Box
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Página
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {loading ? "..." : `${page} / ${totalPages || 1}`}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </LayoutColumns>

      {/* Modal de criação / edição */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <form onSubmit={onSubmit}>
          <DialogTitle>
            {editingComunicado ? "Editar Comunicado" : "Novo Comunicado"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <BrainTextFieldControlled
                name="titulo"
                control={control}
                label="Título"
                required
              />
              <BrainTextFieldControlled
                name="conteudo"
                control={control}
                label="Conteúdo"
                required
                multiline
                rows={4}
              />
              <BrainDateTextControlled
                name="data"
                control={control}
                label="Data de publicação"
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createComunicado.isPending || updateComunicado.isPending}
            >
              {editingComunicado ? "Salvar" : "Criar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Excluir Comunicado</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir este comunicado? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={deleteComunicado.isPending}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
