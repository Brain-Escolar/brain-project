export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { generateTitlePage } from "@/utils/utils";
import ProfessorDetalheContent from "./ProfessorDetalheContent";

export const metadata: Metadata = {
  title: generateTitlePage("Acompanhamento do professor"),
  description: "Diário de classe, notas e anotações de um professor",
};

export default function ProfessorDetalhePage() {
  return <ProfessorDetalheContent />;
}
