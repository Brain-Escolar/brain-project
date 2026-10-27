"use client";

import { MenuItem, TextField } from "@mui/material";
import { useAnoLetivo } from "@/contexts/AnoLetivoContext";
import { StatusAnoLetivo } from "@/services/domains/ano-letivo";

const SUFIXO: Record<StatusAnoLetivo, string> = {
  ABERTO: "",
  PLANEJAMENTO: " (planejamento)",
  ENCERRADO: " (encerrado)",
};

/** Escolhe qual ano letivo as telas mostram. Só para a equipe da escola. */
export default function SeletorAnoLetivo() {
  const { anos, anoVisto, selecionar, temSeletor } = useAnoLetivo();

  if (!temSeletor || anos.length < 2 || !anoVisto) return null;

  return (
    <TextField
      select
      size="small"
      label="Ano letivo"
      value={anoVisto.ano}
      onChange={(e) => selecionar(Number(e.target.value))}
      sx={{ minWidth: 120, display: { xs: "none", sm: "inline-flex" } }}
    >
      {anos.map((a) => (
        <MenuItem key={a.ano} value={a.ano}>
          {a.ano}
          {SUFIXO[a.status]}
        </MenuItem>
      ))}
    </TextField>
  );
}
