"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useDocumentoMutations } from "@/hooks/useDocumentoMutations";
import { DocumentoResponse } from "@/services/domains/documento";
import ArquivosDocumento from "./ArquivosDocumento";
import { formatarInstante } from "./formatadores";

interface ValidarDocumentoDialogProps {
  open: boolean;
  documento: DocumentoResponse | null;
  nomePessoa?: string;
  onClose: () => void;
}

/**
 * Aprovação ou rejeição de um documento EM_ANALISE.
 *
 * A validade é opcional e serve para documentos que vencem — o comprovante de
 * residência, por exemplo. Passada a data, o documento volta a contar como
 * pendente no checklist.
 */
export default function ValidarDocumentoDialog({
  open,
  documento,
  nomePessoa,
  onClose,
}: ValidarDocumentoDialogProps) {
  const { aprovar, rejeitar } = useDocumentoMutations();
  const [modo, setModo] = useState<"aprovar" | "rejeitar">("aprovar");
  const [dataValidade, setDataValidade] = useState("");
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    if (open) {
      setModo("aprovar");
      setDataValidade("");
      setMotivo("");
    }
  }, [open]);

  if (!documento) return null;

  const salvando = aprovar.isPending || rejeitar.isPending;
  const hoje = new Date().toISOString().split("T")[0];

  // Erros já viram toast no onError das mutations; o diálogo fica aberto.
  function handleAprovar() {
    aprovar.mutate(
      { id: documento!.id, dataValidade: dataValidade || undefined },
      { onSuccess: onClose },
    );
  }

  function handleRejeitar() {
    rejeitar.mutate({ id: documento!.id, motivo: motivo.trim() }, { onSuccess: onClose });
  }

  return (
    <Dialog open={open} onClose={salvando ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Validar {documento.tipoDescricao}
        {nomePessoa ? ` — ${nomePessoa}` : ""}
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 0.5 }}>
            Enviado em {formatarInstante(documento.enviadoEm)}. Abra os arquivos e confira antes de
            validar.
          </Typography>
          <ArquivosDocumento arquivos={documento.arquivos} />
        </Box>

        {modo === "aprovar" ? (
          <TextField
            label="Válido até (opcional)"
            type="date"
            size="small"
            value={dataValidade}
            onChange={(e) => setDataValidade(e.target.value)}
            helperText="Preencha só para documentos que vencem, como o comprovante de residência."
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: hoje } }}
          />
        ) : (
          <>
            <Alert severity="info">
              O motivo aparece para a família no portal. Diga o que precisa ser corrigido.
            </Alert>
            <TextField
              label="Motivo da rejeição"
              multiline
              minRows={2}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex.: a foto está ilegível, envie novamente a frente e o verso."
              slotProps={{ htmlInput: { maxLength: 1000 } }}
              autoFocus
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        {modo === "aprovar" ? (
          <>
            <Button
              color="error"
              startIcon={<CloseRoundedIcon />}
              onClick={() => setModo("rejeitar")}
              disabled={salvando}
              sx={{ mr: "auto" }}
            >
              Rejeitar
            </Button>
            <Button onClick={onClose} disabled={salvando}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleAprovar}
              disabled={salvando}
              startIcon={aprovar.isPending ? <CircularProgress size={16} /> : <CheckRoundedIcon />}
            >
              Aprovar
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setModo("aprovar")} disabled={salvando}>
              Voltar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleRejeitar}
              disabled={!motivo.trim() || salvando}
              startIcon={rejeitar.isPending ? <CircularProgress size={16} /> : <CloseRoundedIcon />}
            >
              Confirmar rejeição
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
