export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { generateTitlePage } from "@/utils/utils";
import BoletimContent from "./BoletimContent";

export const metadata: Metadata = {
  title: generateTitlePage("Boletim"),
  description: "Acompanhe suas notas, faltas e situação por disciplina",
};

export default function BoletimPage() {
  return <BoletimContent />;
}
