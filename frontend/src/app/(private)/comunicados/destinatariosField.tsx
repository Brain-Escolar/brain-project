"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Box, Button, FormHelperText, IconButton, Tooltip } from "@mui/material";
import { Control, useFieldArray, useWatch } from "react-hook-form";

import { BrainDropdownControlled } from "@/components/brainForms/brainDropdownControlled";
import { useSeries } from "@/hooks/useSeries";
import { useTurmas } from "@/hooks/useTurmas";
import { KeyValue } from "@/services/models/keyValue";

import { ComunicadoFormData, destinatarioDefaultValue } from "./schema";

const PUBLICO_OPTIONS: KeyValue[] = [
  { key: "TODOS", value: "Todos" },
  { key: "ALUNOS", value: "Alunos" },
  { key: "RESPONSAVEIS", value: "Responsáveis" },
  { key: "PROFESSORES", value: "Professores" },
];

const ABRANGENCIA_OPTIONS: KeyValue[] = [
  { key: "GERAL", value: "Toda a escola" },
  { key: "TURMA", value: "Turma" },
  { key: "SEGMENTO", value: "Segmento" },
];

interface DestinatariosFieldProps {
  control: Control<ComunicadoFormData>;
}

interface LinhaDestinatarioProps {
  control: Control<ComunicadoFormData>;
  index: number;
  turmaOptions: KeyValue[];
  serieOptions: KeyValue[];
  podeRemover: boolean;
  onRemover: () => void;
}

function LinhaDestinatario({
  control,
  index,
  turmaOptions,
  serieOptions,
  podeRemover,
  onRemover,
}: LinhaDestinatarioProps) {
  const abrangencia = useWatch({ control, name: `destinatarios.${index}.abrangencia` });

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr auto" },
        gap: 2,
        alignItems: "start",
      }}
    >
      <BrainDropdownControlled
        name={`destinatarios.${index}.publico`}
        control={control}
        label="Quem recebe"
        options={PUBLICO_OPTIONS}
        required
      />

      <BrainDropdownControlled
        name={`destinatarios.${index}.abrangencia`}
        control={control}
        label="Abrangência"
        options={ABRANGENCIA_OPTIONS}
        required
      />

      {abrangencia === "TURMA" ? (
        <BrainDropdownControlled
          name={`destinatarios.${index}.turmaId`}
          control={control}
          label="Turma"
          options={turmaOptions}
          placeholder="Selecione a turma"
          required
        />
      ) : abrangencia === "SEGMENTO" ? (
        <BrainDropdownControlled
          name={`destinatarios.${index}.serieId`}
          control={control}
          label="Segmento"
          options={serieOptions}
          placeholder="Selecione o segmento"
          required
        />
      ) : (
        <Box />
      )}

      <Tooltip title={podeRemover ? "Remover destinatário" : "É preciso ao menos um destinatário"}>
        <span>
          <IconButton onClick={onRemover} disabled={!podeRemover} aria-label="Remover destinatário">
            <DeleteOutlineIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}

/**
 * Público-alvo do comunicado em dois eixos: quem recebe (papel) e qual recorte da escola.
 * Várias linhas se somam, ex.: "responsáveis da turma 3A" + "alunos do 9º ano".
 */
export function DestinatariosField({ control }: DestinatariosFieldProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "destinatarios" });
  const { turmas, loading: loadingTurmas } = useTurmas();
  const { series, loading: loadingSeries } = useSeries();

  const turmaOptions: KeyValue[] = turmas.map((turma) => ({
    key: String(turma.id),
    value: `${turma.nome} — ${turma.serie}`,
  }));

  const serieOptions: KeyValue[] = series.map((serie) => ({
    key: String(serie.id),
    value: serie.nome,
  }));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {fields.map((field, index) => (
        <LinhaDestinatario
          key={field.id}
          control={control}
          index={index}
          turmaOptions={turmaOptions}
          serieOptions={serieOptions}
          podeRemover={fields.length > 1}
          onRemover={() => remove(index)}
        />
      ))}

      {(loadingTurmas || loadingSeries) && (
        <FormHelperText>Carregando turmas e segmentos...</FormHelperText>
      )}

      <Box>
        <Button
          startIcon={<AddIcon />}
          onClick={() => append(destinatarioDefaultValue)}
          sx={{ textTransform: "none" }}
        >
          Adicionar destinatário
        </Button>
      </Box>
    </Box>
  );
}
