export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { generateTitlePage } from "@/utils/utils";
import AnoLetivoContent from "./AnoLetivoContent";

export const metadata: Metadata = {
  title: generateTitlePage("Ano letivo"),
  description: "Anos letivos da escola, calendário de períodos e abertura do ano corrente",
};

export default function AnoLetivoPage() {
  return <AnoLetivoContent />;
}
