"use client";
import LayoutColumns from "@/components/layoutColumns/layoutColumns";
import PageTitle from "@/components/pageTitle/pageTitle";
import SectionMinhasAulas from "@/components/sectionMinhasAulas/sectionMinhasAulas";
import SectionPlanejamento from "@/components/sectionPlanejamento/sectionPlanejamento";
import { useAuth } from "@/hooks/useAuth";
import { Box, Container } from "@mui/material";
import Image from "next/image";

export default function DashProfessorPage() {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Image
          src="/brand/brainy/brainy-front-rgb.png"
          alt=""
          aria-hidden
          width={78}
          height={52}
          priority
          style={{ height: 52, width: "auto" }}
        />
        <PageTitle title={`Bem-vindo, professor ${user?.name ?? ""}!`} />
      </Box>

      <LayoutColumns sizeLeft="70%" sizeRight="30%">
        <SectionMinhasAulas />
        <SectionPlanejamento />
      </LayoutColumns>
    </Container>
  );
}
