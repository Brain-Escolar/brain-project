import React from "react";
import { Box, Typography, Paper, Button, Stack, CircularProgress, Alert } from "@mui/material";
import { useTarefas } from "@/hooks/useTarefas";
import { formatDateFromArray } from "@/utils/utils";
import { InsertInvitation } from "@mui/icons-material";

function ConteudosTarefas() {
  const { tarefas, loading, error } = useTarefas();

  return (
    <Box>
      {/* Conteúdo do dia */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Conteúdo do dia
        </Typography>
        <Paper sx={{ bgcolor: "grey.50" }}>
          <Typography variant="body1" color="text.secondary">
            It is a long established fact that a reader will be distracted
          </Typography>
        </Paper>
      </Box>

      {/* Novas tarefas */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">Novas tarefas</Typography>
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
            {tarefas.map((tarefa) => (
              <Paper
                key={tarefa.id}
                sx={{ border: "1px solid", borderColor: "grey.200", px: 2, py: 1 }}
              >
                <Typography variant="h6" gutterBottom fontWeight={"bold"}>
                  {tarefa.titulo}
                </Typography>

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
                        document_file_name.pdf
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        100kb • Complete
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
                    Prazo: {formatDateFromArray(tarefa.prazo)}
                  </Typography>
                </Box>
              </Paper>
            ))}
            {tarefas.length === 0 && (
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma tarefa encontrada
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
