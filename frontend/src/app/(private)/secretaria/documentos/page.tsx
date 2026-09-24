"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import SegmentedControl from "@/components/segmentedControl/segmentedControl";
import ArquivosDocumento from "@/components/documentacao/ArquivosDocumento";
import ValidarDocumentoDialog from "@/components/documentacao/ValidarDocumentoDialog";
import { formatarDataLocal, formatarInstante } from "@/components/documentacao/formatadores";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useDocumentosFila } from "@/hooks/useDocumentosFila";
import { documentoApi } from "@/services/api";
import { DocumentoFilaResponse, StatusDocumento } from "@/services/domains/documento";

const TITULO_VAZIO: Record<StatusDocumento, string> = {
  EM_ANALISE: "Nenhum documento aguardando validação.",
  REJEITADO: "Nenhum documento rejeitado aguardando reenvio.",
  APROVADO: "Nenhum documento aprovado.",
};

/**
 * Fila de validação de documentos de matrícula. Os envios da família pelo
 * portal caem aqui, e a secretaria também é avisada por alerta.
 */
export default function DocumentosPage() {
  const [status, setStatus] = useState<StatusDocumento>("EM_ANALISE");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selecionado, setSelecionado] = useState<DocumentoFilaResponse | null>(null);

  const { documentos, totalElements, loading, error } = useDocumentosFila({
    status,
    page,
    size: rowsPerPage,
  });

  const { data: documento, isLoading: carregandoDocumento } = useQuery({
    queryKey: QUERY_KEYS.documentos.detail(selecionado?.id ?? 0),
    queryFn: () => documentoApi.getDocumento(selecionado!.id),
    enabled: !!selecionado,
    // As URLs dos arquivos expiram em minutos: sempre buscar de novo ao abrir.
    staleTime: 0,
    gcTime: 0,
  });

  const validando = selecionado?.status === "EM_ANALISE";

  return (
    <PageScaffold
      title="Documentos"
      description="Valide os documentos de matrícula enviados pela secretaria e pelas famílias."
    >
      <Box sx={{ mb: 2 }}>
        <SegmentedControl
          ariaLabel="Filtrar documentos por status"
          value={status}
          onChange={(valor) => {
            setStatus(valor);
            setPage(0);
          }}
          options={[
            { value: "EM_ANALISE", label: "Aguardando validação" },
            { value: "REJEITADO", label: "Rejeitados" },
            { value: "APROVADO", label: "Aprovados" },
          ]}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
          {documentos.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {TITULO_VAZIO[status]}
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Pessoa</TableCell>
                  <TableCell>Documento</TableCell>
                  <TableCell>Enviado em</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documentos.map((doc) => (
                  <TableRow key={doc.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {doc.nomePessoa}
                      </Typography>
                    </TableCell>
                    <TableCell>{doc.tipoDescricao}</TableCell>
                    <TableCell>{formatarInstante(doc.enviadoEm)}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant={doc.status === "EM_ANALISE" ? "contained" : "text"}
                        onClick={() => setSelecionado(doc)}
                      >
                        {doc.status === "EM_ANALISE" ? "Validar" : "Ver"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={(_, novaPagina) => setPage(novaPagina)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 20, 50]}
            labelRowsPerPage="Linhas por página"
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      )}

      {validando && (
        <ValidarDocumentoDialog
          open={!!documento}
          documento={documento ?? null}
          nomePessoa={selecionado?.nomePessoa}
          onClose={() => setSelecionado(null)}
        />
      )}

      {selecionado && !validando && (
        <Dialog open onClose={() => setSelecionado(null)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selecionado.tipoDescricao} — {selecionado.nomePessoa}
          </DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {carregandoDocumento || !documento ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                {documento.status === "REJEITADO" && documento.motivoRejeicao && (
                  <Alert severity="error">Motivo: {documento.motivoRejeicao}</Alert>
                )}
                <Typography variant="body2" color="text.secondary">
                  {documento.status === "APROVADO" ? "Aprovado" : "Rejeitado"}
                  {documento.validadoPor ? ` por ${documento.validadoPor}` : ""}
                  {documento.validadoEm ? ` em ${formatarInstante(documento.validadoEm)}` : ""}
                  {documento.dataValidade
                    ? ` · válido até ${formatarDataLocal(documento.dataValidade)}`
                    : ""}
                </Typography>
                <ArquivosDocumento arquivos={documento.arquivos} />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelecionado(null)}>Fechar</Button>
          </DialogActions>
        </Dialog>
      )}
    </PageScaffold>
  );
}
