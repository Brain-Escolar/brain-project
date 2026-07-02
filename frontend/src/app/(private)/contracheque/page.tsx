"use client";
import { useState } from "react";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import FactCheckRounded from "@mui/icons-material/FactCheckRounded";
import ReceiptLongRounded from "@mui/icons-material/ReceiptLongRounded";
import HoleritePanel from "./HoleritePanel";
import InformePanel from "./InformePanel";
import * as S from "./styles";

type View = "holerite" | "informe";

export default function ContrachequePage() {
  const [view, setView] = useState<View>("holerite");

  return (
    <PageScaffold
      title="Contracheque e declarações"
      description="Consulte seu contracheque mensal ou o informe de rendimentos anual para a declaração de imposto de renda."
    >
      <S.Seg role="tablist">
        <S.SegBtn $active={view === "holerite"} role="tab" aria-selected={view === "holerite"} onClick={() => setView("holerite")}>
          <ReceiptLongRounded />
          Contracheque mensal
        </S.SegBtn>
        <S.SegBtn $active={view === "informe"} role="tab" aria-selected={view === "informe"} onClick={() => setView("informe")}>
          <FactCheckRounded />
          Informe de rendimentos
        </S.SegBtn>
      </S.Seg>

      {view === "holerite" ? <HoleritePanel /> : <InformePanel />}
    </PageScaffold>
  );
}
