"use client";

import { Box } from "@mui/material";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import BrainyMascot from "@/components/brainyMascot/BrainyMascot";
import LayoutColumns from "@/components/layoutColumns/layoutColumns";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useAuth } from "@/hooks/useAuth";
import { useInicioOrientacao } from "@/hooks/useInicioOrientacao";
import SectionAtendimentos from "./sectionAtendimentos";
import SectionBuscaAlunos from "./sectionBuscaAlunos";
import SectionComunicados from "./sectionComunicados";
import SectionIndicadores from "./sectionIndicadores";
import * as S from "./styles";

function dataPorExtenso(): string {
  const rotulo = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  return rotulo.charAt(0).toUpperCase() + rotulo.slice(1);
}

export default function DashOrientadorPage() {
  const { user } = useAuth();
  const { inicio, loading, error } = useInicioOrientacao();

  return (
    <PageScaffold>
      <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
        <BrainyMascot height={65} />
        <PageTitle
          title={`Olá, ${user?.name ?? ""}!`}
          description={`Orientação · ${dataPorExtenso()}`}
        />
      </Box>

      {error ? (
        <S.ErrorHint>{error}</S.ErrorHint>
      ) : (
        <S.Stack>
          <SectionIndicadores indicadores={inicio?.indicadores} loading={loading} />

          <LayoutColumns sizeLeft="65%" sizeRight="35%">
            <S.Stack>
              <SectionBuscaAlunos />
              <SectionAtendimentos atendimentos={inicio?.atendimentos ?? []} loading={loading} />
            </S.Stack>
            <SectionComunicados comunicados={inicio?.comunicados ?? []} loading={loading} />
          </LayoutColumns>
        </S.Stack>
      )}
    </PageScaffold>
  );
}
