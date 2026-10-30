export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { generateTitlePage } from "@/utils/utils";
import ProfessoresContent from "./ProfessoresContent";

export const metadata: Metadata = {
  title: generateTitlePage("Professores"),
  description: "Diário de classe, lançamento de notas e anotações de cada professor",
};

export default function ProfessoresPage() {
  return <ProfessoresContent />;
}
