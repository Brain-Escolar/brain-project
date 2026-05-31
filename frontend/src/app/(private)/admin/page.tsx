"use client";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { useAuth } from "@/hooks/useAuth";
import { Typography } from "@mui/material";

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <PageScaffold title="Dashboard do Administrador">
      <Typography variant="h4" component="h1" gutterBottom>
        Bem-vindo, Admin {user?.name}!
      </Typography>
    </PageScaffold>
  );
}
