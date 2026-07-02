"use client";

import FileUploadArea from "@/components/fileUploadArea";
import { DisciplinaTurmasProfessorResponse } from "@/services/domains/professor/response";
import { TipoMaterial } from "@/services/domains/material-complementar";
import { cssVarColor, cssVarFontSize, cssVarFontWeight, cssVarRadius, cssVarShadow } from "@/styles";
import AttachFileRounded from "@mui/icons-material/AttachFileRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import LinkRounded from "@mui/icons-material/LinkRounded";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useMaterialComplementarMutations } from "../../useMaterialComplementarMutations";

interface ModalAdicionarMaterialProps {
  open: boolean;
  disciplinas: DisciplinaTurmasProfessorResponse[];
  defaultDisciplinaId?: number;
  onClose: () => void;
}

export default function ModalAdicionarMaterial({
  open,
  disciplinas,
  defaultDisciplinaId,
  onClose,
}: ModalAdicionarMaterialProps) {
  const { createMaterial } = useMaterialComplementarMutations();

  const [titulo, setTitulo] = useState("");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [tipo, setTipo] = useState<TipoMaterial>("ARQUIVO");
  const [descricao, setDescricao] = useState("");
  const [url, setUrl] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      setDisciplinaId(defaultDisciplinaId ? String(defaultDisciplinaId) : "");
    }
  }, [open, defaultDisciplinaId]);

  const valido = titulo.trim() && disciplinaId && (tipo === "LINK" ? url.trim() : !!arquivo);

  function handleClose() {
    setTitulo("");
    setDisciplinaId("");
    setTipo("ARQUIVO");
    setDescricao("");
    setUrl("");
    setArquivo(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valido) return;

    await createMaterial.mutateAsync({
      dados: {
        titulo: titulo.trim(),
        disciplinaId: Number(disciplinaId),
        tipo,
        descricao: descricao.trim() || undefined,
        url: tipo === "LINK" ? url.trim() : undefined,
      },
      arquivo: tipo === "ARQUIVO" ? (arquivo ?? undefined) : undefined,
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
          <Typography sx={{ fontSize: cssVarFontSize("h3"), fontWeight: cssVarFontWeight("semibold"), color: cssVarColor("text") }}>
            Novo material complementar
          </Typography>
          <Typography sx={{ fontSize: cssVarFontSize("body2"), color: cssVarColor("textSecondary"), mt: 0.5 }}>
            Anexe um arquivo ou compartilhe um link de apoio para a disciplina.
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose} aria-label="Fechar">
          <CloseRounded fontSize="small" />
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, px: 3, py: 2.5 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Título"
              placeholder="Ex.: Apostila de frações"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Disciplina</InputLabel>
              <Select value={disciplinaId} label="Disciplina" onChange={(e) => setDisciplinaId(e.target.value)}>
                {disciplinas.map((d) => (
                  <MenuItem key={d.disciplinaId} value={String(d.disciplinaId)}>
                    {d.nomeDisciplina}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <ToggleButtonGroup
            value={tipo}
            exclusive
            onChange={(_, value) => value && setTipo(value)}
            size="small"
            sx={{ alignSelf: "flex-start" }}
          >
            <ToggleButton value="ARQUIVO">
              <AttachFileRounded fontSize="small" sx={{ mr: 0.75 }} />
              Arquivo
            </ToggleButton>
            <ToggleButton value="LINK">
              <LinkRounded fontSize="small" sx={{ mr: 0.75 }} />
              Link
            </ToggleButton>
          </ToggleButtonGroup>

          {tipo === "ARQUIVO" ? (
            <FileUploadArea
              files={arquivo ? [arquivo] : []}
              onChange={(files) => setArquivo(files[files.length - 1] ?? null)}
              multiple={false}
            />
          ) : (
            <TextField
              label="URL"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              fullWidth
            />
          )}

          <TextField
            label="Descrição (opcional)"
            placeholder="Uma frase sobre como usar este material"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            multiline
            rows={2}
            fullWidth
          />
        </DialogContent>

        <DialogActions
          sx={{ px: 3, pt: 2, pb: 2.75, gap: 1.25, borderTop: `1px solid ${cssVarColor("borderSubtle")}` }}
        >
          <Button variant="outlined" onClick={handleClose} disabled={createMaterial.isPending}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={!valido || createMaterial.isPending}
            startIcon={createMaterial.isPending ? <CircularProgress size={16} /> : undefined}
          >
            {createMaterial.isPending ? "Adicionando..." : "Adicionar material"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
