"use client";
import { RoutesEnum } from "@/enums";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Typography,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { planejamentoAnualApi } from "@/services/api";
import { Add, Download } from "@mui/icons-material";

export default function PlanejamentoAnualListaPage() {
  const router = useRouter();

  const { data: response, isLoading } = useQuery({
    queryKey: ["planejamento-anual"],
    queryFn: () => planejamentoAnualApi.listar(),
  });

  const planejamentos = response?.content || [];

  function handleNovo() {
    router.push(RoutesEnum.PLANEJAMENTO_ANUAL_CADASTRO);
  }

  function handleDownload(url: string) {
    window.open(url, "_blank");
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  return (
    <PageScaffold
      title="Planejamentos Anuais"
      description="Visualize e gerencie os planejamentos anuais da escola"
      actions={
        <Button variant="contained" startIcon={<Add />} onClick={handleNovo}>
          Novo Planejamento
        </Button>
      }
    >

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : planejamentos && planejamentos.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ano</TableCell>
                <TableCell>Arquivo</TableCell>
                <TableCell>Tamanho</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {planejamentos.map((planejamento, index) => (
                <TableRow key={index} hover>
                  <TableCell>{planejamento.ano}</TableCell>
                  <TableCell>{planejamento.nome}</TableCell>
                  <TableCell>{formatFileSize(planejamento.tamanho)}</TableCell>
                  <TableCell>
                    <Tooltip title="Download">
                      <IconButton
                        color="primary"
                        onClick={() => handleDownload(planejamento.downloadUrl)}
                      >
                        <Download />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            Nenhum planejamento anual cadastrado ainda.
          </Typography>
        </Paper>
      )}
    </PageScaffold>
  );
}
