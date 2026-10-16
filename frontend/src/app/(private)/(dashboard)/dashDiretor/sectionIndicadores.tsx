"use client";

import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import { Skeleton } from "@mui/material";
import { IndicadoresDiretorResponse } from "@/services/domains/diretor";
import { formatarDecimal, formatarInteiro, formatarPercentual } from "@/utils/formatoNumero";
import * as S from "./styles";

interface Indicador {
  chave: string;
  rotulo: string;
  icone: React.ReactNode;
  valor: string;
  delta: { texto: string; tendencia: S.Tendencia };
}

/** Variação entre o período corrente e o anterior; neutra quando falta um dos lados. */
function variacao(
  atual: number | null,
  anterior: number | null,
  periodoAnterior: string | null,
  formatar: (v: number) => string,
): { texto: string; tendencia: S.Tendencia } {
  if (atual == null) return { texto: "Sem lançamentos no período", tendencia: "neutra" };
  if (anterior == null || !periodoAnterior)
    return { texto: "Primeiro período do ano", tendencia: "neutra" };
  const diferenca = Math.round((atual - anterior) * 10) / 10;
  if (diferenca === 0) return { texto: `Estável vs. ${periodoAnterior}`, tendencia: "neutra" };
  const sinal = diferenca > 0 ? "+" : "−";
  return {
    texto: `${sinal}${formatar(Math.abs(diferenca))} vs. ${periodoAnterior}`,
    tendencia: diferenca > 0 ? "alta" : "baixa",
  };
}

function montarIndicadores(d: IndicadoresDiretorResponse): Indicador[] {
  return [
    {
      chave: "alunos",
      rotulo: "Total de alunos",
      icone: <GroupOutlinedIcon />,
      valor: formatarInteiro(d.alunosMatriculados),
      delta: { texto: `Matriculados em ${formatarInteiro(d.turmas)} turmas`, tendencia: "neutra" },
    },
    {
      chave: "professores",
      rotulo: "Professores ativos",
      icone: <BadgeOutlinedIcon />,
      valor: formatarInteiro(d.professoresAtivos),
      delta: {
        texto: `${formatarInteiro(d.disciplinas)} disciplinas na grade`,
        tendencia: "neutra",
      },
    },
    {
      chave: "frequencia",
      rotulo: "Frequência média",
      icone: <EventAvailableOutlinedIcon />,
      valor: formatarPercentual(d.frequenciaMedia),
      delta: variacao(
        d.frequenciaMedia,
        d.frequenciaPeriodoAnterior,
        d.periodoAnterior,
        (v) => `${formatarDecimal(v)} p.p.`,
      ),
    },
    {
      chave: "media",
      rotulo: "Média geral",
      icone: <TrendingUpIcon />,
      valor: formatarDecimal(d.mediaGeral),
      delta: variacao(d.mediaGeral, d.mediaPeriodoAnterior, d.periodoAnterior, (v) =>
        formatarDecimal(v),
      ),
    },
  ];
}

function IconeTendencia({ tendencia }: { tendencia: S.Tendencia }) {
  if (tendencia === "alta") return <TrendingUpIcon />;
  if (tendencia === "baixa") return <TrendingDownIcon />;
  return <TrendingFlatIcon />;
}

interface SectionIndicadoresProps {
  indicadores?: IndicadoresDiretorResponse;
  loading: boolean;
}

export default function SectionIndicadores({ indicadores, loading }: SectionIndicadoresProps) {
  if (loading || !indicadores) {
    return (
      <S.KpiGrid>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={128} sx={{ borderRadius: "18px" }} />
        ))}
      </S.KpiGrid>
    );
  }

  return (
    <S.KpiGrid>
      {montarIndicadores(indicadores).map((k) => (
        <S.Kpi key={k.chave}>
          <S.KpiTop>
            <S.Overline>{k.rotulo}</S.Overline>
            <S.IconBox>{k.icone}</S.IconBox>
          </S.KpiTop>
          <S.KpiValor>{k.valor}</S.KpiValor>
          <S.KpiDelta $tendencia={k.delta.tendencia}>
            <IconeTendencia tendencia={k.delta.tendencia} />
            {k.delta.texto}
          </S.KpiDelta>
        </S.Kpi>
      ))}
    </S.KpiGrid>
  );
}
