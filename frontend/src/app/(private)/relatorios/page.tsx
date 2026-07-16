export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { generateTitlePage } from "@/utils/utils";
import RelatoriosContent from "./RelatoriosContent";

export const metadata: Metadata = {
  title: generateTitlePage("Relatórios"),
  description: "Consulte seus relatórios de notas e frequência por disciplina",
};

export default function RelatoriosPage() {
  return <RelatoriosContent />;
}
