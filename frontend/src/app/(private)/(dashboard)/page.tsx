"use client";
import { useAuth } from "@/hooks/useAuth";
import { Box, CircularProgress, Typography } from "@mui/material";
import DashProfessorPage from "./dashProfessor/dashProfessor";

export default function Dashboard() {
  const { user, isLoading } = useAuth();

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

  if (user?.role === "PROFESSOR") {
    return <DashProfessorPage />;
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
