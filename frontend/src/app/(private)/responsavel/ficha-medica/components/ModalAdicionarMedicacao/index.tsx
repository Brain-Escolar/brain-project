"use client";

import CloseRounded from "@mui/icons-material/CloseRounded";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius, cssVarShadow } from "@/styles";
import { useFichaMedicaResponsavelMutations } from "../../useFichaMedicaResponsavelMutations";

interface ModalAdicionarMedicacaoProps {
  open: boolean;
  alunoId: number | null;
  nomeAluno: string;
  onClose: () => void;
}

export default function ModalAdicionarMedicacao({
  open,
  alunoId,
  nomeAluno,
  onClose,
}: ModalAdicionarMedicacaoProps) {
  const { incluirMedicacao } = useFichaMedicaResponsavelMutations(alunoId);

  const [nome, setNome] = useState("");
  const [dosagem, setDosagem] = useState("");
  const [horario, setHorario] = useState("");
  const [observacao, setObservacao] = useState("");

  // So o nome e obrigatorio — igual ao @NotBlank do CadastroMedicacaoDto.
  // Exigir dosagem levaria a familia a chutar numero em ficha de saude.
  const valido = nome.trim().length > 0;

  function handleClose() {
    setNome("");
    setDosagem("");
    setHorario("");
    setObservacao("");
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valido || alunoId == null) return;

    await incluirMedicacao.mutateAsync({
      nome: nome.trim(),
      dosagem: dosagem.trim() || undefined,
      horario: horario.trim() || undefined,
      observacao: observacao.trim() || undefined,
    });
    handleClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
            sx={{
              fontSize: cssVarFontSize("h3"),
              fontWeight: cssVarFontWeight("semibold"),
              color: cssVarColor("text"),
            }}
          >
            Nova medicação
          </Typography>
          <Typography
            sx={{ fontSize: cssVarFontSize("body2"), color: cssVarColor("textSecondary"), mt: 0.5 }}
          >
            Informe o que {nomeAluno} usa hoje. A escola vê esta lista na ficha médica.
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose} aria-label="Fechar">
          <CloseRounded fontSize="small" />
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, px: 3, py: 2.5 }}>
          <TextField
            label="Medicação"
            placeholder="Ex.: Ritalina LA"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 255 } }}
            required
            fullWidth
            autoFocus
          />

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              label="Dosagem (opcional)"
              placeholder="Ex.: 20 mg"
              value={dosagem}
              onChange={(e) => setDosagem(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 255 } }}
              sx={{ flex: 1, minWidth: 180 }}
            />
            <TextField
              label="Horário (opcional)"
              placeholder="Ex.: 07h, antes da aula"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 255 } }}
              sx={{ flex: 1, minWidth: 180 }}
            />
          </Box>

          <TextField
            label="Observação (opcional)"
            placeholder="Algo que a escola precise saber na hora de administrar"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 500 } }}
            multiline
            rows={2}
            fullWidth
          />
        </DialogContent>

        <DialogActions
          sx={{ px: 3, pt: 2, pb: 2.75, gap: 1.25, borderTop: `1px solid ${cssVarColor("borderSubtle")}` }}
        >
          <Button variant="outlined" onClick={handleClose} disabled={incluirMedicacao.isPending}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={!valido || incluirMedicacao.isPending}
            startIcon={incluirMedicacao.isPending ? <CircularProgress size={16} /> : undefined}
          >
            {incluirMedicacao.isPending ? "Adicionando..." : "Adicionar medicação"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
