"use client";

import { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEventoMutations } from "@/hooks/useEventoMutations";
import { EventoResponse, TipoEvento } from "@/services/domains/evento";
import { TIPO_OPTIONS } from "./eventoTipos";
import BrainDropdownField from "@/components/brainForms/_base/brainDropdownField/brainDropdownField";

interface NovoEventoModalProps {
  open: boolean;
  onClose: () => void;
  /** Data inicial pré-selecionada no formato "yyyy-MM-dd". */
  dataInicial?: string;
  /** Evento existente: quando informado, o modal opera em modo edição. */
  evento?: EventoResponse | null;
  /** Restringe as opções de tipo exibidas (ex.: Secretaria só cria Reunião/Feriado/Outro). */
  tipoOptions?: { value: TipoEvento; label: string }[];
}

export default function NovoEventoModal({
  open,
  onClose,
  dataInicial,
  evento,
  tipoOptions = TIPO_OPTIONS,
}: NovoEventoModalProps) {
  const { criarEvento, atualizarEvento } = useEventoMutations();
  const isEdicao = !!evento;

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [tipo, setTipo] = useState<TipoEvento>("OUTRO");

  useEffect(() => {
    if (open) {
      setTitulo(evento?.titulo ?? "");
      setDescricao(evento?.descricao ?? "");
      setDataEvento(evento?.dataEvento ?? dataInicial ?? new Date().toISOString().slice(0, 10));
      setTipo(evento?.tipo ?? "OUTRO");
    }
  }, [open, dataInicial, evento]);

  const isSaving = criarEvento.isPending || atualizarEvento.isPending;
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

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>
        {isEdicao ? "Editar Evento" : "Novo Evento"}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEdicao
            ? "Altere os dados do evento"
            : "Cadastre um evento no calendário"}
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

          <BrainDropdownField<TipoEvento>
            label="Tipo"
            size="medium"
            disableClearable
            value={tipo}
            onChange={(v) => v && setTipo(v)}
            options={tipoOptions.map((opt) => ({ key: opt.value, value: opt.label }))}
          />

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
