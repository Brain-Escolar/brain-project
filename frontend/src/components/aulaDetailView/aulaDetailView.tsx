"use client";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import React from "react";

interface AlunoPresenca {
  id: string;
  nome: string;
  presente: boolean;
  registrosNoBim: number;
  faltas: number;
}

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  dataEnvio: string;
}

interface RegistroDisciplinar {
  id: string;
  aluno: string;
  tipo: string;
  descricao: string;
  data: string;
}

interface AulaDetailViewProps {
  type: "presenca" | "tarefas" | "registros";
  data?: AlunoPresenca[] | Tarefa[] | RegistroDisciplinar[];
}

const AulaDetailView: React.FC<AulaDetailViewProps> = ({ type, data }) => {
  if (type === "registros") {
    const registrosData = data as RegistroDisciplinar[];

    return (
      <Box>
        {/* Registros do dia */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
          >
            <Typography variant="h6">Registros do dia</Typography>
            <Button variant="contained" color="primary" size="small">
              + SALVAR
            </Button>
          </Box>

          <Stack spacing={3}>
            {registrosData.map((registro) => (
              <Paper key={registro.id} sx={{ border: "1px solid", borderColor: "grey.200" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {registro.aluno}
                  </Typography>
                  <Chip
                    label={registro.tipo}
                    color="secondary"
                    size="small"
                    sx={{ bgcolor: "grey.200", color: "text.primary" }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Box>
      </Box>
    );
  }

  return null;
};

export default AulaDetailView;
