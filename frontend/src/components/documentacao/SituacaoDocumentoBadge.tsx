"use client";

import Badge, { BadgeTone } from "@/components/badge";
import { SituacaoDocumento } from "@/services/domains/documento";

const CONFIG: Record<SituacaoDocumento, { label: string; tone: BadgeTone }> = {
  PENDENTE: { label: "Pendente", tone: "neutral" },
  EM_ANALISE: { label: "Em análise", tone: "info" },
  APROVADO: { label: "Aprovado", tone: "success" },
  REJEITADO: { label: "Rejeitado", tone: "error" },
  VENCIDO: { label: "Vencido", tone: "warning" },
};

export default function SituacaoDocumentoBadge({ situacao }: { situacao: SituacaoDocumento }) {
  const { label, tone } = CONFIG[situacao];
  return <Badge $tone={tone}>{label}</Badge>;
}
