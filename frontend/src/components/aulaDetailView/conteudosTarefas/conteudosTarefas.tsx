import React, { useState } from "react";
import { Box, Typography, Paper, Stack, CircularProgress, Alert, Chip } from "@mui/material";
import { InsertInvitation } from "@mui/icons-material";
import { format } from "date-fns";
import { useTarefasAula } from "@/hooks/useTarefasAula";
import { useTarefasDatas } from "@/hooks/useTarefasDatas";
import DateSelector from "@/components/dateSelector";

interface ConteudosTarefasProps {
  aulaId: string;
}

function ConteudosTarefas({ aulaId }: ConteudosTarefasProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dataFormatada = format(selectedDate, "yyyy-MM-dd");

  const { tarefas, loading, error } = useTarefasAula(aulaId, dataFormatada);
  const { datas: datasDisponiveis } = useTarefasDatas(aulaId);

  const hasTasksOnDate = datasDisponiveis.includes(dataFormatada);

  return (
    <Box>
      {/* Seletor de data */}
      <Box sx={{ mb: 3 }}>
        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
        {datasDisponiveis.length > 0 && !hasTasksOnDate && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            Nenhuma tarefa nesta data. Datas com tarefas: {datasDisponiveis.join(", ")}
          </Typography>
        )}
      </Box>

      {/* Tarefas */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Tarefas
        </Typography>

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
            {tarefas.map((tarefa) => (
              <Paper
                key={tarefa.id}
                sx={{ border: "1px solid", borderColor: "grey.200", px: 2, py: 1 }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {tarefa.titulo}
                  </Typography>
                  <Chip label={tarefa.turma} size="small" variant="outlined" />
                </Box>

                {tarefa.documentoUrl && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: "primary.main",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="caption" color="white" sx={{ fontSize: "12px" }}>
                        📄
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {tarefa.documentoUrl}
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Typography variant="body2" color="text.secondary" paragraph>
                  {tarefa.conteudo}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <InsertInvitation fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Prazo: {tarefa.prazo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    · Prof. {tarefa.professor}
                  </Typography>
                </Box>
              </Paper>
            ))}
            {tarefas.length === 0 && (
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma tarefa encontrada para esta data
                </Typography>
              </Paper>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default ConteudosTarefas;
