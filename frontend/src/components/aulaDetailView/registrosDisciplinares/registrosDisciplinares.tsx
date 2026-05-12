import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { format } from "date-fns";
import DateSelector from "@/components/dateSelector";
import { useAnotacoesAula } from "@/hooks/useAnotacoesAula";

interface RegistrosDisciplinaresProps {
  aulaId: string;
}

function RegistrosDisciplinares({ aulaId }: RegistrosDisciplinaresProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dataFormatada = format(selectedDate, "yyyy-MM-dd");

  const { anotacoes, loading, error } = useAnotacoesAula(aulaId, dataFormatada);

  return (
    <Box>
      {/* Seletor de data */}
      <Box sx={{ mb: 3 }}>
        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </Box>

      {/* Registros do dia */}
      <Box>
        <Box
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
        >
          <Typography variant="h6">Registros do dia</Typography>
          <Button variant="contained" color="primary" size="small">
            + SALVAR
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <Stack spacing={3}>
            {anotacoes.map((anotacao) => (
              <Paper
                key={anotacao.anotacaoId}
                sx={{ border: "1px solid", borderColor: "grey.200", p: 2 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {anotacao.nomeAluno}
                  </Typography>
                  {anotacao.observacao && (
                    <Chip
                      label={anotacao.observacao}
                      size="small"
                      sx={{ bgcolor: "grey.200", color: "text.primary" }}
                    />
                  )}
                </Box>

                <Typography variant="body2" color="text.secondary">
                  {anotacao.anotacao}
                </Typography>
              </Paper>
            ))}
            {anotacoes.length === 0 && (
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhum registro disciplinar encontrado para esta data
                </Typography>
              </Paper>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default RegistrosDisciplinares;
