"use client";
import { useAuth } from "@/hooks/useAuth";
import { usePerfilAtivo } from "@/contexts/PerfilAtivoContext";
import { UserRoleEnum } from "@/enums";
import { Box, CircularProgress, Typography } from "@mui/material";
import DashProfessorPage from "./dashProfessor/dashProfessor";
import DashAlunoPage from "./dashAluno/dashAluno";
import DashResponsavelPage from "./dashResponsavel/dashResponsavel";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  // Despacha pelo perfil ativo — quem acumula troca no SeletorPerfil.
  const { perfilAtivo } = usePerfilAtivo();

  if (isLoading && !user) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  if (perfilAtivo === UserRoleEnum.PROFESSOR) {
    return <DashProfessorPage />;
  }

  if (perfilAtivo === UserRoleEnum.ESTUDANTE) {
    return <DashAlunoPage />;
  }

  if (perfilAtivo === UserRoleEnum.RESPONSAVEL) {
    return <DashResponsavelPage />;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography>Bem-vindo ao Brain! Redirecionando para sua área específica...</Typography>
      {user && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          Usuário: {user.email} | Role: {user.role}
        </Typography>
      )}
    </Box>
  );
}
