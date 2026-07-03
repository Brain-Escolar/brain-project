"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEventoMutations } from "@/hooks/useEventoMutations";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { EventoResponse, TipoEvento } from "@/services/domains/evento";
import { TIPO_OPTIONS } from "./eventoTipos";

interface NovoEventoModalProps {
  open: boolean;
  onClose: () => void;
  /** Data inicial pré-selecionada no formato "yyyy-MM-dd". */
  dataInicial?: string;
  /** Evento existente: quando informado, o modal opera em modo edição. */
  evento?: EventoResponse | null;
}

/** Monta um ISO date-time no fuso de São Paulo (sem horário de verão = -03:00). */
function toIsoSaoPaulo(data: string, hora: string): string {
  return `${data}T${hora}:00-03:00`;
}

export default function NovoEventoModal({ open, onClose, dataInicial, evento }: NovoEventoModalProps) {
  const { criarEvento, atualizarEvento } = useEventoMutations();
  const { adicionarEventos } = useGoogleCalendar();
  const isEdicao = !!evento;

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [tipo, setTipo] = useState<TipoEvento>("OUTRO");
  const [sincronizarGoogle, setSincronizarGoogle] = useState(false);
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFim, setHoraFim] = useState("09:00");

  useEffect(() => {
    if (open) {
      setTitulo(evento?.titulo ?? "");
      setDescricao(evento?.descricao ?? "");
      setDataEvento(evento?.dataEvento ?? dataInicial ?? new Date().toISOString().slice(0, 10));
      setTipo(evento?.tipo ?? "OUTRO");
      setSincronizarGoogle(false);
      setHoraInicio("08:00");
      setHoraFim("09:00");
    }
  }, [open, dataInicial, evento]);

  const isSaving = criarEvento.isPending || atualizarEvento.isPending || adicionarEventos.isPending;
  const podeSalvar = titulo.trim().length > 0 && !!dataEvento && !isSaving;

  const handleSalvar = async () => {
    if (!podeSalvar) return;

    if (isEdicao) {
      // descricao vazia vai como "" (não undefined): o backend ignora null e o usuário
      // precisa conseguir limpar a descrição de um evento existente.
      await atualizarEvento.mutateAsync({
        id: evento.id,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        dataEvento,
        tipo,
      });
      onClose();
      return;
    }

    await criarEvento.mutateAsync({
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      dataEvento,
      tipo,
    });

    if (sincronizarGoogle) {
      try {
        await adicionarEventos.mutateAsync([
          {
            titulo: titulo.trim(),
            descricao: descricao.trim() || undefined,
            dataInicio: toIsoSaoPaulo(dataEvento, horaInicio),
            dataFim: toIsoSaoPaulo(dataEvento, horaFim),
          },
        ]);
      } catch {
        // erro já tratado/notificado no hook; o evento interno foi criado mesmo assim
      }
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>
        {isEdicao ? "Editar Evento" : "Novo Evento"}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEdicao
            ? "Altere os dados do evento"
            : "Cadastre um evento no calendário e, opcionalmente, no seu Google Agenda"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            fullWidth
            required
            autoFocus
          />

          <TextField
            label="Tipo"
            select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoEvento)}
            fullWidth
          >
            {TIPO_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Data"
            type="date"
            value={dataEvento}
            onChange={(e) => setDataEvento(e.target.value)}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />

          {!isEdicao && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={sincronizarGoogle}
                  onChange={(e) => setSincronizarGoogle(e.target.checked)}
                />
              }
              label="Adicionar ao Google Agenda"
            />
          )}

          {!isEdicao && sincronizarGoogle && (
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Hora início"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Hora fim"
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button
          onClick={handleSalvar}
          variant="contained"
          disabled={!podeSalvar}
          startIcon={isSaving ? <CircularProgress size={16} /> : undefined}
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
