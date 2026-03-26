"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import LayoutColumns from "@/components/layoutColumns/layoutColumns";
import { UserRoleEnum } from "@/enums";
import PageTitle from "@/components/pageTitle/pageTitle";
import SectionMinhasAulas from "@/components/sectionMinhasAulas/sectionMinhasAulas";
import SectionPlanejamento from "@/components/sectionPlanejamento/sectionPlanejamento";
import { useAuth } from "@/hooks/useAuth";
import { Container } from "@mui/material";

export default function DashProfessorPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={[UserRoleEnum.PROFESSOR]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <PageTitle title={` Bem-vindo, Professor ${user?.email}!`} />

        <LayoutColumns sizeLeft="70%" sizeRight="30%">
          <SectionMinhasAulas />
          <SectionPlanejamento />
        </LayoutColumns>
      </Container>
    </ProtectedRoute>
  );
}
