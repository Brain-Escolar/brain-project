import { formatarDataLocal } from "@/components/documentacao/formatadores";
import { EscolaDocumentoResponse } from "@/services/domains/documento-escolar";

/** 7.25 -> "7,3" (com as casas decimais da escala). Nulo vira travessão. */
export function formatarNota(valor: number | null | undefined, casas = 1): string {
  if (valor == null) return "—";
  return valor.toFixed(casas).replace(".", ",");
}

export function formatarPercentual(valor: number | null | undefined): string {
  if (valor == null) return "—";
  return `${Math.round(valor)}%`;
}

export function formatarData(iso?: string | null): string {
  return formatarDataLocal(iso) ?? "—";
}

/** "2026-10-01T10:42:00" -> "1 de outubro de 2026 às 10:42". */
export function formatarEmissao(iso: string): string {
  const data = new Date(iso);
  const dia = data.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${dia} às ${hora}`;
}

export function rodapeEmissao(emitidoEm: string, emitidoPor: string | null): string {
  return `Emitido em ${formatarEmissao(emitidoEm)}${emitidoPor ? ` por ${emitidoPor}` : ""}`;
}

export function cabecalhoEscola(escola: EscolaDocumentoResponse) {
  return {
    escolaNome: escola.nome ?? "Escola",
    escolaLinhas: [escola.unidade, escola.cnpj ? `CNPJ ${escola.cnpj}` : null].filter(
      (l): l is string => !!l,
    ),
  };
}

export function assinaturasPadrao(emitidoPor: string | null) {
  return [
    { nome: emitidoPor ?? "", cargo: "Secretaria escolar" },
    { nome: "", cargo: "Direção" },
  ];
}
