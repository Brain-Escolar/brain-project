"use client";

import { Alert, Button } from "@mui/material";
import { useAnoLetivo } from "@/contexts/AnoLetivoContext";

/**
 * Lembra, em toda tela, que o que está ali não é do ano corrente. Sem isso é
 * fácil esquecer o seletor em 2025 e estranhar a turma "vazia" de hoje.
 */
export default function AvisoAnoLetivo() {
  const { anoVisto, anoCorrente, vendoOutroAno, voltarAoCorrente } = useAnoLetivo();

  if (!vendoOutroAno || !anoVisto || !anoCorrente) return null;

  const descricao =
    anoVisto.status === "ENCERRADO"
      ? "ano encerrado, somente consulta"
      : anoVisto.status === "PLANEJAMENTO"
        ? "ano em planejamento"
        : "";

  return (
    <Alert
      severity={anoVisto.status === "ENCERRADO" ? "warning" : "info"}
      sx={{ mb: 2 }}
      action={
        <Button color="inherit" size="small" onClick={voltarAoCorrente}>
          Voltar para {anoCorrente.ano}
        </Button>
      }
    >
      Você está vendo o ano letivo de <strong>{anoVisto.ano}</strong>
      {descricao ? ` (${descricao})` : ""}.
    </Alert>
  );
}
