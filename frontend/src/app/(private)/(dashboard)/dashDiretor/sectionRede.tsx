"use client";

import { Skeleton } from "@mui/material";
import { IndicadoresDiretorResponse } from "@/services/domains/diretor";
import { formatarInteiro } from "@/utils/formatoNumero";
import * as S from "./styles";

interface SectionRedeProps {
  indicadores?: IndicadoresDiretorResponse;
  loading: boolean;
}

export default function SectionRede({ indicadores, loading }: SectionRedeProps) {
  const itens = indicadores
    ? [
        { rotulo: "Unidades", valor: indicadores.unidades },
        { rotulo: "Turmas", valor: indicadores.turmas },
        { rotulo: "Séries", valor: indicadores.series },
        { rotulo: "Disciplinas", valor: indicadores.disciplinas },
      ]
    : [];

  return (
    <S.Card>
      <S.CardTitle>Visão geral da rede</S.CardTitle>
      {loading || !indicadores ? (
        <Skeleton variant="rounded" height={110} />
      ) : (
        <S.RedeGrid>
          {itens.map((item) => (
            <div key={item.rotulo}>
              <S.RedeValor>{formatarInteiro(item.valor)}</S.RedeValor>
              <S.RedeRotulo>{item.rotulo}</S.RedeRotulo>
            </div>
          ))}
        </S.RedeGrid>
      )}
    </S.Card>
  );
}
