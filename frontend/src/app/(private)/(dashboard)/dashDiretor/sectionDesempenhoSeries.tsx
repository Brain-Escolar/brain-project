"use client";

import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Skeleton, Tooltip } from "@mui/material";
import { DesempenhoSerieResponse } from "@/services/domains/diretor";
import { formatarDecimal } from "@/utils/formatoNumero";
import * as S from "./styles";

interface SectionDesempenhoSeriesProps {
  series: DesempenhoSerieResponse[];
  periodo?: string;
  notaAprovacao?: number;
  notaMaxima?: number;
  loading: boolean;
}

/** Média das notas por série no período corrente; abaixo da aprovação ganha alerta (cor + ícone). */
export default function SectionDesempenhoSeries({
  series,
  periodo,
  notaAprovacao = 6,
  notaMaxima = 10,
  loading,
}: SectionDesempenhoSeriesProps) {
  return (
    <S.Card>
      <S.CardHeader>
        <S.CardTitleGroup>
          <S.IconBox>
            <BarChartOutlinedIcon />
          </S.IconBox>
          <S.CardTitle>Desempenho por série</S.CardTitle>
        </S.CardTitleGroup>
        {periodo && <S.CardCaption>Média · {periodo}</S.CardCaption>}
      </S.CardHeader>

      {loading ? (
        <Skeleton variant="rounded" height={220} />
      ) : series.length === 0 ? (
        <S.EmptyHint>Nenhuma nota lançada no período.</S.EmptyHint>
      ) : (
        <S.SerieList>
          {series.map((s) => {
            const media = s.media ?? 0;
            const alerta = s.media != null && s.media < notaAprovacao;
            const pct = Math.max(0, Math.min(100, (media / notaMaxima) * 100));
            return (
              <Tooltip
                key={s.serieId}
                placement="top-start"
                title={`${s.serie}: média ${formatarDecimal(s.media)}${alerta ? " — abaixo da aprovação" : ""}`}
              >
                <S.SerieRow>
                  <S.SerieHead>
                    <span>{s.serie}</span>
                    <S.SerieValor>
                      {alerta && (
                        <WarningAmberRoundedIcon aria-label="Abaixo da nota de aprovação" />
                      )}
                      {formatarDecimal(s.media)}
                    </S.SerieValor>
                  </S.SerieHead>
                  <S.Trilho>
                    <S.Preenchimento $pct={pct} $alerta={alerta} />
                  </S.Trilho>
                </S.SerieRow>
              </Tooltip>
            );
          })}
        </S.SerieList>
      )}
    </S.Card>
  );
}
