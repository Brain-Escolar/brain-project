"use client";

import { Box } from "@mui/material";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import BrainyMascot from "@/components/brainyMascot/BrainyMascot";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useAuth } from "@/hooks/useAuth";
import { useInicioDiretor } from "@/hooks/useDiretor";
import SectionComunicados from "../dashOrientador/sectionComunicados";
import SectionDesempenhoSeries from "./sectionDesempenhoSeries";
import SectionFrequencia from "./sectionFrequencia";
import SectionIndicadores from "./sectionIndicadores";
import SectionRede from "./sectionRede";
import * as S from "./styles";

function saudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function dataPorExtenso(): string {
  const rotulo = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  return rotulo.charAt(0).toUpperCase() + rotulo.slice(1);
}

/** Painel inicial da Direção: a escola inteira, todas as unidades. */
export default function DashDiretorPage() {
  const { user } = useAuth();
  const { inicio, loading, error } = useInicioDiretor();
  const primeiroNome = user?.name?.split(" ")[0] ?? "";
  const indicadores = inicio?.indicadores;

  return (
    <PageScaffold>
      <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
        <BrainyMascot height={65} />
        <PageTitle
          title={`${saudacao()}, ${primeiroNome}!`}
          description={`${dataPorExtenso()} · Direção · Todas as unidades`}
        />
      </Box>

      {error ? (
        <S.ErrorHint>{error}</S.ErrorHint>
      ) : (
        <S.Stack>
          <SectionIndicadores indicadores={indicadores} loading={loading} />

          <S.Grid>
            <S.Stack>
              <SectionDesempenhoSeries
                series={inicio?.desempenhoPorSerie ?? []}
                periodo={indicadores?.periodoAtual}
                notaAprovacao={indicadores?.notaAprovacao}
                notaMaxima={indicadores?.notaMaxima}
                loading={loading}
              />
              <SectionFrequencia meses={inicio?.frequenciaMensal ?? []} loading={loading} />
            </S.Stack>
            <S.Stack>
              <SectionRede indicadores={indicadores} loading={loading} />
              <SectionComunicados comunicados={inicio?.comunicados ?? []} loading={loading} />
            </S.Stack>
          </S.Grid>
        </S.Stack>
      )}
    </PageScaffold>
  );
}
