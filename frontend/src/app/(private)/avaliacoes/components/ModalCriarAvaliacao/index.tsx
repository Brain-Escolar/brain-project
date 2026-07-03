"use client";

import FileUploadArea from "@/components/fileUploadArea";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useMinhasTurmas } from "@/hooks/useMinhasTurmas";
import {
  cssVarColor,
  cssVarFontSize,
  cssVarFontWeight,
  cssVarRadius,
  cssVarShadow,
} from "@/styles";
import { AvaliacaoPostRequest, TipoAvaliacao } from "@/services/domains/avaliacao/request";
import CloseRounded from "@mui/icons-material/CloseRounded";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useAvaliacaoMutations } from "../../../avaliacao/useAvaliacaoMutations";

interface ModalCriarAvaliacaoProps {
  open: boolean;
  onClose: () => void;
}

const TIPOS: { value: TipoAvaliacao; label: string }[] = [
  { value: "PROVA", label: "Prova" },
  { value: "TRABALHO", label: "Trabalho" },
  { value: "LISTA", label: "Lista" },
  { value: "SEMINARIO", label: "Seminário" },
];

interface TurmaOption {
  turmaId: number;
  label: string;
}

interface DatasTurma {
  dataAplicacao: string;
  dataEntregaNotas: string;
}

export default function ModalCriarAvaliacao({ open, onClose }: ModalCriarAvaliacaoProps) {
  const queryClient = useQueryClient();
  const { createAvaliacao } = useAvaliacaoMutations();
  const { disciplinas } = useMinhasTurmas();

  const [nome, setNome] = useState("");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [tipo, setTipo] = useState<TipoAvaliacao>("PROVA");
  const [notaMaxima, setNotaMaxima] = useState("10");
  const [conteudo, setConteudo] = useState("");
  const [notaExtra, setNotaExtra] = useState(false);
  const [turmasSelecionadas, setTurmasSelecionadas] = useState<TurmaOption[]>([]);
  const [datasPorTurma, setDatasPorTurma] = useState<Record<number, DatasTurma>>({});
  const [anexos, setAnexos] = useState<File[]>([]);

  const turmasDisponiveis = useMemo<TurmaOption[]>(() => {
    const disciplina = disciplinas.find((d) => String(d.disciplinaId) === disciplinaId);
    if (!disciplina) return [];
    return disciplina.turmas.map((t) => ({
      turmaId: t.turmaId,
      label: `${t.serieNome} ${t.nomeTurma}`,
    }));
  }, [disciplinas, disciplinaId]);

  const valido = nome.trim() && disciplinaId && notaMaxima && turmasSelecionadas.length > 0;

  function handleClose() {
    setNome("");
    setDisciplinaId("");
    setTipo("PROVA");
    setNotaMaxima("10");
    setConteudo("");
    setNotaExtra(false);
    setTurmasSelecionadas([]);
    setDatasPorTurma({});
    setAnexos([]);
    onClose();
  }

  function handleDisciplinaChange(value: string) {
    setDisciplinaId(value);
    setTurmasSelecionadas([]);
    setDatasPorTurma({});
  }

  function handleTurmasChange(selecionadas: TurmaOption[]) {
    setTurmasSelecionadas(selecionadas);
    setDatasPorTurma((atual) => {
      const proximo: Record<number, DatasTurma> = {};
      selecionadas.forEach((t) => {
        proximo[t.turmaId] = atual[t.turmaId] ?? { dataAplicacao: "", dataEntregaNotas: "" };
      });
      return proximo;
    });
  }

  function handleDataTurmaChange(turmaId: number, campo: keyof DatasTurma, valor: string) {
    setDatasPorTurma((atual) => ({
      ...atual,
      [turmaId]: { ...atual[turmaId], [campo]: valor },
    }));
  }

  function handleUsarMesmaData(campo: keyof DatasTurma, valor: string) {
    setDatasPorTurma((atual) => {
      const proximo: Record<number, DatasTurma> = {};
      Object.keys(atual).forEach((id) => {
        proximo[Number(id)] = { ...atual[Number(id)], [campo]: valor };
      });
      return proximo;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valido) return;

    const dados: AvaliacaoPostRequest = {
      nome: nome.trim(),
      disciplinaId: Number(disciplinaId),
      tipo,
      notaMaxima: Number(notaMaxima.replace(",", ".")),
      conteudo: conteudo || undefined,
      notaExtra,
      turmas: turmasSelecionadas.map((t) => ({
        turmaId: t.turmaId,
        dataAplicacao: datasPorTurma[t.turmaId]?.dataAplicacao || undefined,
        dataEntregaNotas: datasPorTurma[t.turmaId]?.dataEntregaNotas || undefined,
      })),
    };

    await createAvaliacao.mutateAsync({ dados, anexos: anexos.length ? anexos : undefined });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.avaliacoes.all });
    handleClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
        sx: {
          borderRadius: cssVarRadius("xl"),
          boxShadow: cssVarShadow("level3"),
          overflow: "hidden",
        },
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
          flexShrink: 0,
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
            Nova avaliação
          </Typography>
          <Typography
            sx={{ fontSize: cssVarFontSize("body2"), color: cssVarColor("textSecondary"), mt: 0.5 }}
          >
            Defina os dados básicos. Você poderá editar o conteúdo e lançar notas depois.
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose} aria-label="Fechar">
          <CloseRounded fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, px: 3, py: 2.5 }}>
        <TextField
          label="Nome da avaliação"
          placeholder="Ex.: Prova Mensal — Frações"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          fullWidth
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl fullWidth required>
            <InputLabel>Disciplina</InputLabel>
            <Select
              value={disciplinaId}
              label="Disciplina"
              onChange={(e) => handleDisciplinaChange(e.target.value)}
            >
              {disciplinas.map((d) => (
                <MenuItem key={d.disciplinaId} value={String(d.disciplinaId)}>
                  {d.nomeDisciplina}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={tipo}
              label="Tipo"
              onChange={(e) => setTipo(e.target.value as TipoAvaliacao)}
            >
              {TIPOS.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            label="Nota máxima"
            value={notaMaxima}
            onChange={(e) => setNotaMaxima(e.target.value)}
            required
            sx={{ flex: 1 }}
          />
          <FormControlLabel
            control={
              <Checkbox checked={notaExtra} onChange={(e) => setNotaExtra(e.target.checked)} />
            }
            label="Nota extra"
          />
        </Box>

        <TextField
          label="Conteúdo / descrição"
          placeholder="Tópicos cobrados, instruções..."
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          multiline
          rows={3}
          fullWidth
        />

        <Autocomplete
          multiple
          options={turmasDisponiveis}
          value={turmasSelecionadas}
          onChange={(_, value) => handleTurmasChange(value)}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(a, b) => a.turmaId === b.turmaId}
          disabled={!disciplinaId}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Turmas"
              placeholder="Selecione as turmas"
              required={turmasSelecionadas.length === 0}
            />
          )}
        />

        {turmasSelecionadas.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Datas por turma
            </Typography>
            {turmasSelecionadas.map((t) => (
              <Box key={t.turmaId} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography variant="body2" sx={{ width: 90, flexShrink: 0 }}>
                  {t.label}
                </Typography>
                <TextField
                  label="Aplicação"
                  type="date"
                  size="small"
                  value={datasPorTurma[t.turmaId]?.dataAplicacao ?? ""}
                  onChange={(e) => {
                    handleDataTurmaChange(t.turmaId, "dataAplicacao", e.target.value);
                    if (tipo === "PROVA") handleUsarMesmaData("dataAplicacao", e.target.value);
                  }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="Entrega de notas"
                  type="date"
                  size="small"
                  value={datasPorTurma[t.turmaId]?.dataEntregaNotas ?? ""}
                  onChange={(e) => {
                    handleDataTurmaChange(t.turmaId, "dataEntregaNotas", e.target.value);
                    if (tipo === "PROVA") handleUsarMesmaData("dataEntregaNotas", e.target.value);
                  }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Box>
            ))}
            {tipo === "PROVA" && (
              <Typography variant="caption" color="text.secondary">
                Como o tipo é Prova, a data preenchida numa turma é replicada para as demais. Você
                pode ajustar individualmente depois de criar a avaliação.
              </Typography>
            )}
          </Box>
        )}

        <div>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Anexos (opcional)
          </Typography>
          <FileUploadArea files={anexos} onChange={setAnexos} multiple />
        </div>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pt: 2,
          pb: 2.75,
          gap: 1.25,
          borderTop: `1px solid ${cssVarColor("borderSubtle")}`,
        }}
      >
        <Button variant="outlined" onClick={handleClose} disabled={createAvaliacao.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={!valido || createAvaliacao.isPending}
          startIcon={createAvaliacao.isPending ? <CircularProgress size={16} /> : undefined}
        >
          {createAvaliacao.isPending ? "Criando..." : "Criar avaliação"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
