export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { generateTitlePage } from "@/utils/utils";
import AcompanhamentoTurmaContent from "./AcompanhamentoTurmaContent";

export const metadata: Metadata = {
  title: generateTitlePage("Acompanhamento por turma"),
  description: "Notas, faltas, atrasos e anotações de comportamento de cada turma",
};

export default function AcompanhamentoTurmaPage() {
  return <AcompanhamentoTurmaContent />;
}
