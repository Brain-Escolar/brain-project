"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useFichasMedicas } from "@/hooks/useFichasMedicas";
import { RoutesEnum, UserRoleEnum } from "@/enums";
import { useFichaMedicaMutations } from "@/app/(private)/ficha-medica/useFichaMedicaMutations";
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
  Tooltip,
} from "@mui/material";
import { Edit, Delete, Add, LocalHospital, Download } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import PageTitle from "@/components/pageTitle/pageTitle";
import { fichaMedicaApi } from "@/services/api";

export default function ListaFichaMedicaPage() {
  const router = useRouter();
  const { fichasMedicas, loading, error, refetch } = useFichasMedicas();
  const { deleteFichaMedica } = useFichaMedicaMutations();
  const [downloadingFichaId, setDownloadingFichaId] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fichaMedicaToDelete, setFichaMedicaToDelete] = useState<{
    id: string;
    nome: string;
  } | null>(null);

  const handleEditFichaMedica = (fichaMedicaId: string) => {
    router.push(`${RoutesEnum.FICHA_MEDICA}/${fichaMedicaId}`);
  };

  const handleDeleteFichaMedica = (fichaMedicaId: string, nome: string) => {
    setFichaMedicaToDelete({ id: fichaMedicaId, nome });
    setDeleteModalOpen(true);
  };

  const handleDownloadAllLaudos = async (fichaMedicaId: string) => {
    try {
      setDownloadingFichaId(fichaMedicaId);
      const res = await fichaMedicaApi.listarLaudos(fichaMedicaId, { size: 1000 });
      const laudos = res.content ?? [];

      if (laudos.length === 0) {
        alert("Nenhum laudo encontrado no sistema.");
        return;
      }

      /* Usando links temporários para evitar bloqueio de pop-ups */
      for (let i = 0; i < laudos.length; i++) {
        const laudo = laudos[i];
        const link = document.createElement("a");
        link.href = laudo.downloadUrl;
        link.download = laudo.nome || `laudo-${laudo.id}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (i < laudos.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
    } catch (e) {
      console.error("Erro ao baixar laudos:", e);
      alert("Erro ao baixar laudos. Tente novamente.");
    } finally {
      setDownloadingFichaId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (fichaMedicaToDelete) {
      try {
        await deleteFichaMedica.mutateAsync(fichaMedicaToDelete.id);
        setDeleteModalOpen(false);
        setFichaMedicaToDelete(null);
      } catch (error) {
        console.error("Erro ao deletar ficha médica:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setFichaMedicaToDelete(null);
  };

  const handleNewFichaMedica = () => {
    alert("Selecione um usuário para criar a ficha médica.");
  };

  const formatTipoSanguineo = (tipo: string): string => {
    if (!tipo) return "-";
    return tipo.replace("_", " ");
  };

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.ADMIN, UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <PageTitle
              title={"Lista de Fichas Médicas"}
              description="Gerencie as fichas médicas cadastradas no sistema"
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewFichaMedica}
            sx={{ height: "fit-content" }}
          >
            Nova Ficha Médica
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

        {!loading && !error && fichasMedicas.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <LocalHospital sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhuma ficha médica cadastrada
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Comece criando uma nova ficha médica para registrar informações de saúde
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={handleNewFichaMedica}>
              Criar Primeira Ficha Médica
            </Button>
          </Box>
        )}

        {!loading && !error && fichasMedicas.length > 0 && (
          <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
            <Table sx={{ minWidth: 650 }} aria-label="tabela de fichas médicas">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Usuário</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Tipo Sanguíneo</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Necessidades Especiais</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Alergias</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Laudos</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fichasMedicas.map((ficha) => (
                  <TableRow
                    key={ficha.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {ficha.nome}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {ficha.tipoSanguineo ? (
                        <Chip
                          label={formatTipoSanguineo(ficha.tipoSanguineo)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 250,
                        }}
                      >
                        {ficha.necessidadesEspeciais || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {(ficha.alergiasAlimentares || ficha.alergiasMedicamentosas) && (
                          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                            {ficha.alergiasAlimentares && (
                              <Chip label="Alimentar" size="small" color="warning" />
                            )}
                            {ficha.alergiasMedicamentosas && (
                              <Chip label="Medicamento" size="small" color="error" />
                            )}
                          </Box>
                        )}
                        {!ficha.alergiasAlimentares && !ficha.alergiasMedicamentosas && (
                          <Typography variant="body2" color="text.secondary">
                            Nenhuma
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <Tooltip title="Baixar todos os laudos">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadAllLaudos(ficha.id.toString())}
                              disabled={downloadingFichaId === ficha.id.toString()}
                              sx={{ color: "primary.main" }}
                            >
                              {downloadingFichaId === ficha.id.toString() ? (
                                <CircularProgress size={16} />
                              ) : (
                                <Download fontSize="small" />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditFichaMedica(ficha.id.toString())}
                          sx={{ color: "primary.main" }}
                          title="Editar"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteFichaMedica(ficha.id.toString(), ficha.nome)}
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

        {/* Modal de confirmação para deletar ficha médica */}
        <Dialog
          open={deleteModalOpen}
          onClose={handleCancelDelete}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Tem certeza que deseja excluir a ficha médica de{" "}
              <strong>{fichaMedicaToDelete?.nome}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCancelDelete}
              color="inherit"
              disabled={deleteFichaMedica.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deleteFichaMedica.isPending}
              startIcon={deleteFichaMedica.isPending ? <CircularProgress size={16} /> : <Delete />}
            >
              {deleteFichaMedica.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ProtectedRoute>
  );
}
