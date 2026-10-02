"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import FileUploadArea from "@/components/fileUploadArea";
import { MAX_ARQUIVOS_POR_DOCUMENTO } from "@/services/domains/documento";
import { ACCEPT_DOCUMENTO } from "./formatadores";

interface EnviarDocumentoDialogProps {
  open: boolean;
  /** Ex.: "CPF de Maria Silva". */
  titulo: string;
  /** Aviso extra, ex.: reenvio de documento aprovado. */
  aviso?: string;
  enviando: boolean;
  onClose: () => void;
  onEnviar: (arquivos: File[]) => Promise<unknown>;
}

export default function EnviarDocumentoDialog({
  open,
  titulo,
  aviso,
  enviando,
  onClose,
  onEnviar,
}: EnviarDocumentoDialogProps) {
  const [arquivos, setArquivos] = useState<File[]>([]);

  useEffect(() => {
    if (open) setArquivos([]);
  }, [open]);

  const excedeu = arquivos.length > MAX_ARQUIVOS_POR_DOCUMENTO;

  async function handleEnviar() {
    try {
      await onEnviar(arquivos);
      onClose();
    } catch {
      // O erro já virou toast no onError da mutation; o diálogo fica aberto para tentar de novo.
    }
  }

  return (
    <Dialog open={open} onClose={enviando ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Enviar {titulo}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <DialogContentText>
          PDF, JPG ou PNG, até 10 MB cada. Se o documento tiver frente e verso, envie os dois
          arquivos juntos (até {MAX_ARQUIVOS_POR_DOCUMENTO}).
        </DialogContentText>
        {aviso && <Alert severity="warning">{aviso}</Alert>}
        <FileUploadArea
          files={arquivos}
          onChange={setArquivos}
          multiple
          accept={ACCEPT_DOCUMENTO}
          label="Clique para selecionar os arquivos"
        />
        {excedeu && (
          <Alert severity="error">Selecione no máximo {MAX_ARQUIVOS_POR_DOCUMENTO} arquivos.</Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={enviando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleEnviar}
          disabled={arquivos.length === 0 || excedeu || enviando}
          startIcon={enviando ? <CircularProgress size={16} /> : undefined}
        >
          {enviando ? "Enviando..." : "Enviar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
