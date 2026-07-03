"use client";

import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseRounded from "@mui/icons-material/CloseRounded";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import EditOutlined from "@mui/icons-material/EditOutlined";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius, cssVarShadow } from "@/styles";
import { useEventoMutations } from "@/hooks/useEventoMutations";
import { EventoResponse } from "@/services/domains/evento";
import { TIPO_CONFIG, formatarDataBr } from "./eventoTipos";

interface DetalheEventoModalProps {
  open: boolean;
  evento: EventoResponse | null;
  onClose: () => void;
  onEditar: (evento: EventoResponse) => void;
}

export default function DetalheEventoModal({ open, evento, onClose, onEditar }: DetalheEventoModalProps) {
  const { excluirEvento } = useEventoMutations();
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  if (!evento) return null;

  const tipoConfig = TIPO_CONFIG[evento.tipo];

  const handleExcluir = async () => {
    try {
      await excluirEvento.mutateAsync(evento.id);
      setConfirmandoExclusao(false);
      onClose();
    } catch {
      // erro já notificado pelo hook; mantém o modal aberto
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: cssVarRadius("xl"), boxShadow: cssVarShadow("level3"), overflow: "hidden" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            px: 3,
            pt: 2.75,
            pb: 2,
            borderBottom: `1px solid ${cssVarColor("borderSubtle")}`,
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: cssVarFontSize("h3"), fontWeight: cssVarFontWeight("semibold"), color: cssVarColor("text") }}
            >
              {evento.titulo}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.75 }}>
              <Box
                sx={{
                  bgcolor: tipoConfig.color,
                  color: "white",
                  borderRadius: cssVarRadius("sm"),
                  px: 1,
                  py: 0.25,
                  fontSize: cssVarFontSize("small"),
                  fontWeight: cssVarFontWeight("medium"),
                }}
              >
                {tipoConfig.labelSingular}
              </Box>
              <Typography sx={{ fontSize: cssVarFontSize("body2"), color: cssVarColor("textSecondary") }}>
                {formatarDataBr(evento.dataEvento)}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="Fechar">
            <CloseRounded fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Typography
            sx={{ fontSize: cssVarFontSize("small"), fontWeight: cssVarFontWeight("medium"), color: cssVarColor("textSecondary"), mb: 0.5 }}
          >
            Descrição
          </Typography>
          {evento.descricao ? (
            <Typography sx={{ fontSize: cssVarFontSize("body2"), color: cssVarColor("text"), whiteSpace: "pre-wrap" }}>
              {evento.descricao}
            </Typography>
          ) : (
            <Typography sx={{ fontSize: cssVarFontSize("body2"), color: cssVarColor("textSecondary"), fontStyle: "italic" }}>
              Sem descrição
            </Typography>
          )}
        </DialogContent>

        <DialogActions
          sx={{ px: 3, pt: 2, pb: 2.75, gap: 1.25, borderTop: `1px solid ${cssVarColor("borderSubtle")}` }}
        >
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutline />}
            onClick={() => setConfirmandoExclusao(true)}
            sx={{ mr: "auto" }}
          >
            Excluir
          </Button>
          <Button variant="contained" startIcon={<EditOutlined />} onClick={() => onEditar(evento)}>
            Editar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmandoExclusao} onClose={() => setConfirmandoExclusao(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o evento <strong>{evento.titulo}</strong>? Esta ação não pode
            ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmandoExclusao(false)} disabled={excluirEvento.isPending}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleExcluir}
            disabled={excluirEvento.isPending}
            startIcon={excluirEvento.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {excluirEvento.isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
