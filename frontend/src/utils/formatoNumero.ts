/** Formatação de números para exibição em pt-BR (vírgula decimal). */

/** 8.25 → "8,3" (casas fixas). Nulo vira "—". */
export function formatarDecimal(valor: number | null | undefined, casas = 1): string {
  if (valor == null || Number.isNaN(valor)) return "—";
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

/** 94.1 → "94,1%". Recebe o percentual já em 0–100. */
export function formatarPercentual(valor: number | null | undefined, casas = 1): string {
  if (valor == null || Number.isNaN(valor)) return "—";
  return `${formatarDecimal(valor, casas)}%`;
}

/** 1284 → "1.284". */
export function formatarInteiro(valor: number | null | undefined): string {
  if (valor == null || Number.isNaN(valor)) return "—";
  return valor.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}
