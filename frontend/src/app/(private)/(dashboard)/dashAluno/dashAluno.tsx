"use client";

import LayoutColumns from "@/components/layoutColumns/layoutColumns";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useAuth } from "@/hooks/useAuth";
import { Container } from "@mui/material";
import SectionAulasAluno from "./sectionAulasAluno";
import SectionResumoSemana from "./sectionResumoSemana";

export default function DashAlunoPage() {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageTitle title={`Olá, ${user?.name}!`} description="Organize as atividades da semana" />

      <LayoutColumns sizeLeft="65%" sizeRight="35%">
        <SectionAulasAluno />
        <SectionResumoSemana />
      </LayoutColumns>
    </Container>
  );
}
