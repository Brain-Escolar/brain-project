"use client";

import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import { Skeleton, Tooltip } from "@mui/material";
import { FrequenciaMensalResponse } from "@/services/domains/diretor";
import { formatarPercentual } from "@/utils/formatoNumero";
import * as S from "./styles";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/**
 * Frequência costuma variar em poucos pontos perto de 90%; com o eixo em zero
 * as colunas sairiam todas iguais. O piso acompanha o menor mês (com folga) e
 * nunca sobe acima de 85%, como no design.
 */
function pisoDoEixo(valores: number[]): number {
  const menor = Math.min(...valores);
  return Math.max(0, Math.min(85, Math.floor((menor - 5) / 5) * 5));
}

interface SectionFrequenciaProps {
  meses: FrequenciaMensalResponse[];
  loading: boolean;
}

export default function SectionFrequencia({ meses, loading }: SectionFrequenciaProps) {
  const piso = meses.length ? pisoDoEixo(meses.map((m) => m.frequencia)) : 0;

  return (
    <S.Card>
      <S.CardHeader>
        <S.CardTitleGroup>
          <S.IconBox>
            <EventAvailableOutlinedIcon />
          </S.IconBox>
          <S.CardTitle>Frequência média</S.CardTitle>
        </S.CardTitleGroup>
        <S.CardCaption>Últimos 6 meses</S.CardCaption>
      </S.CardHeader>

      {loading ? (
        <Skeleton variant="rounded" height={150} />
      ) : meses.length === 0 ? (
        <S.EmptyHint>Nenhuma chamada registrada nos últimos meses.</S.EmptyHint>
      ) : (
        <S.Colunas role="list" aria-label="Frequência média por mês">
          {meses.map((m) => {
            const altura = Math.max(8, ((m.frequencia - piso) / (100 - piso)) * 100);
            const rotulo = `${MESES[m.mes - 1]}/${String(m.ano).slice(2)}`;
            return (
              <Tooltip
                key={`${m.ano}-${m.mes}`}
                title={`${rotulo}: ${formatarPercentual(m.frequencia)}`}
              >
                <S.Coluna role="listitem">
                  <S.ColunaValor>{formatarPercentual(m.frequencia, 0)}</S.ColunaValor>
                  <S.ColunaBarra $altura={altura} />
                  <S.ColunaRotulo>{MESES[m.mes - 1]}</S.ColunaRotulo>
                </S.Coluna>
              </Tooltip>
            );
          })}
        </S.Colunas>
      )}
    </S.Card>
  );
}
