"use client";

import LayoutColumns from "@/components/layoutColumns/layoutColumns";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useAuth } from "@/hooks/useAuth";
import { Box } from "@mui/material";
import Image from "next/image";
import SectionAulasAluno from "./sectionAulasAluno";
import SectionResumoSemana from "./sectionResumoSemana";

export default function DashAlunoPage() {
  const { user } = useAuth();

  return (
    <PageScaffold>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.25, mb: 3 }}>
        <Image
          src="/brand/brainy/brainy-front-rgb.png"
          alt=""
          aria-hidden
          width={100}
          height={60}
          priority
          style={{ height: 65, width: "auto" }}
        />
        <PageTitle
          title={`Olá, ${user?.name ?? ""}!`}
          description="Organize as atividades da semana"
        />
      </Box>

      <LayoutColumns sizeLeft="70%" sizeRight="30%">
        <SectionAulasAluno />
        <SectionResumoSemana />
      </LayoutColumns>
    </PageScaffold>
  );
}
