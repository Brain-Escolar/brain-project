export type AnotacaoBadgeVariant = "success" | "warning" | "neutral";

export function getAnotacaoBadgeVariant(tipoAnotacao: string): AnotacaoBadgeVariant {
  const text = tipoAnotacao.toLowerCase();

  if (
    text.includes("elogio") ||
    text.includes("positiv") ||
    text.includes("parabéns") ||
    text.includes("parabens")
  ) {
    return "success";
  }

  if (
    text.includes("advert") ||
    text.includes("atraso") ||
    text.includes("não") ||
    text.includes("nao ") ||
    text.includes("sem ")
  ) {
    return "warning";
  }

  return "neutral";
}
