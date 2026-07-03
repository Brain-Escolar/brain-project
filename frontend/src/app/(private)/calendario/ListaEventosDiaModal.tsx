"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseRounded from "@mui/icons-material/CloseRounded";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius, cssVarShadow } from "@/styles";
import { EventoResponse } from "@/services/domains/evento";
import { TIPO_CONFIG, formatarDataBr } from "./eventoTipos";

interface ListaEventosDiaModalProps {
  open: boolean;
  /** Data do dia no formato "yyyy-MM-dd". */
  data: string | null;
  eventos: EventoResponse[];
  onClose: () => void;
  onSelecionarEvento: (evento: EventoResponse) => void;
  onNovoEvento: () => void;
}

export default function ListaEventosDiaModal({
  open,
  data,
  eventos,
  onClose,
  onSelecionarEvento,
  onNovoEvento,
}: ListaEventosDiaModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: { borderRadius: cssVarRadius("xl"), boxShadow: cssVarShadow("level3"), overflow: "hidden" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: 3,
          pt: 2.75,
          pb: 2,
          borderBottom: `1px solid ${cssVarColor("borderSubtle")}`,
        }}
      >
        <Typography
          sx={{ fontSize: cssVarFontSize("h4"), fontWeight: cssVarFontWeight("semibold"), color: cssVarColor("text") }}
        >
          Eventos de {data ? formatarDataBr(data) : ""}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Fechar">
          <CloseRounded fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 2, py: 1.5 }}>
        {eventos.length === 0 ? (
          <Typography
            sx={{ fontSize: cssVarFontSize("body2"), color: cssVarColor("textSecondary"), textAlign: "center", py: 2 }}
          >
            Nenhum evento neste dia
          </Typography>
        ) : (
          <Stack spacing={0.5}>
            {eventos.map((evento) => (
              <Box
                key={evento.id}
                onClick={() => onSelecionarEvento(evento)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: cssVarRadius("sm"),
                  cursor: "pointer",
                  transition: "background-color 0.15s",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: TIPO_CONFIG[evento.tipo].color,
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: cssVarFontSize("body2"),
                      fontWeight: cssVarFontWeight("medium"),
                      color: cssVarColor("text"),
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {evento.titulo}
                  </Typography>
                  <Typography sx={{ fontSize: cssVarFontSize("small"), color: cssVarColor("textSecondary") }}>
                    {TIPO_CONFIG[evento.tipo].labelSingular}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pt: 1.5, pb: 2.25, borderTop: `1px solid ${cssVarColor("borderSubtle")}` }}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={onNovoEvento} fullWidth>
          Novo evento
        </Button>
      </DialogActions>
    </Dialog>
  );
}
