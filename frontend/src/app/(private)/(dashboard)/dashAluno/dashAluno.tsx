"use client";

import BrainyMascot from "@/components/brainyMascot/BrainyMascot";
import LayoutColumns from "@/components/layoutColumns/layoutColumns";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useAulasAluno } from "@/hooks/useAulasAluno";
import { useAuth } from "@/hooks/useAuth";
import { formatDateForAPI } from "@/utils/utilsDate";
import { Box } from "@mui/material";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import SectionAulasAluno from "./sectionAulasAluno";
import SectionResumoSemana from "./sectionResumoSemana";

function buildHeaderDescription(
  serie?: string,
  turma?: string,
  unidade?: string,
): string {
  const classLabel = [serie, turma].filter(Boolean).join(" ");
  const dateLabel = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const capitalizedDate = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
  const parts = [classLabel, unidade, capitalizedDate].filter(Boolean);
  return parts.join(" · ");
}

export default function DashAlunoPage() {
  const { user } = useAuth();
  const { aulas } = useAulasAluno({ data: formatDateForAPI(new Date()) });
  const contextAula = aulas?.[0];

  return (
    <PageScaffold>
      <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
        <BrainyMascot height={65} />
        <PageTitle
          title={`Olá, ${user?.name ?? ""}!`}
          description={buildHeaderDescription(
            contextAula?.serie,
            contextAula?.turma,
            contextAula?.unidade,
          )}
        />
      </Box>

      <LayoutColumns sizeLeft="70%" sizeRight="30%">
        <SectionAulasAluno />
        <SectionResumoSemana />
      </LayoutColumns>
    </PageScaffold>
  );
}
