"use client";

import { ReactNode } from "react";
import type { BadgeTone } from "@/components/badge";
import * as S from "./styles";

interface KpiCardProps {
  rotulo: string;
  valor: ReactNode;
  icone: ReactNode;
  tone?: BadgeTone;
}

/** Cartão de indicador: ícone, número em destaque e rótulo. */
export default function KpiCard({ rotulo, valor, icone, tone = "primary" }: KpiCardProps) {
  return (
    <S.Card>
      <S.IconBox $tone={tone}>{icone}</S.IconBox>
      <div>
        <S.Valor>{valor}</S.Valor>
        <S.Rotulo>{rotulo}</S.Rotulo>
      </div>
    </S.Card>
  );
}
