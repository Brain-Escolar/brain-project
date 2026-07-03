"use client";

import { BrainDatePickerControlled } from "@/components/brainForms/brainDatePickerControlled";
import { BrainDropdownControlled } from "@/components/brainForms/brainDropdownControlled";
import { BrainMultiSelectControlled } from "@/components/brainForms/brainMultiSelectControlled";
import { BrainTextFieldControlled } from "@/components/brainForms/brainTextFieldControlled";
import FileUploadArea from "@/components/fileUploadArea";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useBrainForm } from "@/hooks/useBrainForm";
import { useMinhasTurmas } from "@/hooks/useMinhasTurmas";
import { AvaliacaoPostRequest } from "@/services/domains/avaliacao/request";
import { KeyValue } from "@/services/models/keyValue";
import {
  cssVarColor,
  cssVarFontSize,
  cssVarFontWeight,
  cssVarRadius,
  cssVarShadow,
} from "@/styles";
import CloseRounded from "@mui/icons-material/CloseRounded";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  IconButton,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { format, isValid as isValidDate } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, Path, useWatch } from "react-hook-form";
import { useAvaliacaoMutations } from "../../../avaliacao/useAvaliacaoMutations";
import { AvaliacaoFormData, avaliacaoDefaultValues, avaliacaoSchema } from "./schema";

interface ModalCriarAvaliacaoProps {
  open: boolean;
  onClose: () => void;
}

const TIPO_OPTIONS: KeyValue[] = [
  { key: "PROVA", value: "Prova" },
  { key: "TRABALHO", value: "Trabalho" },
  { key: "LISTA", value: "Lista" },
  { key: "SEMINARIO", value: "Seminário" },
];

const SEM_TURMAS: number[] = [];

// Date -> yyyy-mm-dd (formato aceito pelo backend e pelos inputs de data da tela de detalhe).
// Retorna undefined para datas vazias ou inválidas.
const toApiDate = (valor?: Date | null) =>
  valor && isValidDate(valor) ? format(valor, "yyyy-MM-dd") : undefined;

export default function ModalCriarAvaliacao({ open, onClose }: ModalCriarAvaliacaoProps) {
  const queryClient = useQueryClient();
  const { createAvaliacao } = useAvaliacaoMutations();
  const { disciplinas } = useMinhasTurmas();
  const [anexos, setAnexos] = useState<File[]>([]);

  const { control, handleSubmit, reset, setValue, isValid } = useBrainForm<AvaliacaoFormData>({
    schema: avaliacaoSchema,
    defaultValues: avaliacaoDefaultValues,
  });

  const disciplinaId = useWatch({ control, name: "disciplinaId" });
  const tipo = useWatch({ control, name: "tipo" });
  const turmaIds = useWatch({ control, name: "turmaIds" }) ?? SEM_TURMAS;
  const datas = useWatch({ control, name: "datas" });

  const disciplinaOptions = useMemo<KeyValue[]>(
    () => disciplinas.map((d) => ({ key: String(d.disciplinaId), value: d.nomeDisciplina })),
    [disciplinas],
  );

  const turmaOptions = useMemo<KeyValue[]>(() => {
    const disciplina = disciplinas.find((d) => String(d.disciplinaId) === disciplinaId);
    if (!disciplina) return [];
    return disciplina.turmas.map((t) => ({
      key: String(t.turmaId),
      value: `${t.serieNome} ${t.nomeTurma}`,
    }));
  }, [disciplinas, disciplinaId]);

  const turmasSelecionadas = useMemo(
    () =>
      turmaIds.flatMap((id) => {
        const opt = turmaOptions.find((t) => t.key === String(id));
        return opt ? [{ turmaId: id, label: opt.value }] : [];
      }),
    [turmaIds, turmaOptions],
  );

  // Ao trocar de disciplina as turmas disponíveis mudam, então limpamos a seleção e as datas.
  const disciplinaAnterior = useRef(disciplinaId);
  useEffect(() => {
    if (disciplinaAnterior.current !== disciplinaId) {
      disciplinaAnterior.current = disciplinaId;
      setValue("turmaIds", []);
      setValue("datas", {});
    }
  }, [disciplinaId, setValue]);

  function handleClose() {
    reset(avaliacaoDefaultValues);
    setAnexos([]);
    onClose();
  }

  function replicarData(campo: "dataAplicacao" | "dataEntregaNotas", valor: Date | null) {
    turmaIds.forEach((id) => setValue(`datas.${id}.${campo}`, valor));
  }

  async function onSubmit(data: AvaliacaoFormData) {
    const dados: AvaliacaoPostRequest = {
      nome: data.nome.trim(),
      disciplinaId: Number(data.disciplinaId),
      tipo: data.tipo,
      notaMaxima: Number(data.notaMaxima.replace(",", ".")),
      conteudo: data.conteudo || undefined,
      notaExtra: data.notaExtra,
      turmas: data.turmaIds.map((id) => ({
        turmaId: id,
        dataAplicacao: toApiDate(data.datas?.[id]?.dataAplicacao),
        dataEntregaNotas: toApiDate(data.datas?.[id]?.dataEntregaNotas),
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
        onSubmit: handleSubmit(onSubmit),
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
        <BrainTextFieldControlled
          name="nome"
          control={control}
          label="Nome da avaliação"
          placeholder="Ex.: Prova Mensal — Frações"
          required
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <BrainDropdownControlled
              name="disciplinaId"
              control={control}
              label="Disciplina"
              options={disciplinaOptions}
              required
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <BrainDropdownControlled
              name="tipo"
              control={control}
              label="Tipo"
              options={TIPO_OPTIONS}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Box sx={{ flex: 1 }}>
            <BrainTextFieldControlled
              name="notaMaxima"
              control={control}
              label="Nota máxima"
              required
            />
          </Box>
          <Controller
            name="notaExtra"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    {...field}
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label="Nota extra"
              />
            )}
          />
        </Box>

        <BrainTextFieldControlled
          name="conteudo"
          control={control}
          label="Conteúdo / descrição"
          placeholder="Tópicos cobrados, instruções..."
          multiline
          rows={3}
        />

        <BrainMultiSelectControlled
          name="turmaIds"
          control={control}
          label="Turmas"
          options={turmaOptions}
          placeholder="Selecione as turmas"
          disabled={!disciplinaId}
          required={turmaIds.length === 0}
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
                <BrainDatePickerControlled
                  name={`datas.${t.turmaId}.dataAplicacao` as Path<AvaliacaoFormData>}
                  control={control}
                  label="Aplicação"
                  onValueChange={
                    tipo === "PROVA" ? (v) => replicarData("dataAplicacao", v) : undefined
                  }
                />
                <BrainDatePickerControlled
                  name={`datas.${t.turmaId}.dataEntregaNotas` as Path<AvaliacaoFormData>}
                  control={control}
                  label="Entrega de notas"
                  minDate={datas?.[t.turmaId]?.dataAplicacao ?? undefined}
                  onValueChange={
                    tipo === "PROVA" ? (v) => replicarData("dataEntregaNotas", v) : undefined
                  }
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
          disabled={!isValid || createAvaliacao.isPending}
          startIcon={createAvaliacao.isPending ? <CircularProgress size={16} /> : undefined}
        >
          {createAvaliacao.isPending ? "Criando..." : "Criar avaliação"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
