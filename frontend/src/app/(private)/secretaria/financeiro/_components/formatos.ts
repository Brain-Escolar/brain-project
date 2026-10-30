const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function moeda(valor: number | null | undefined): string {
  return valor == null ? "–" : BRL.format(valor);
}

export function pct(valor: number | null | undefined): string {
  return valor == null
    ? "–"
    : `${Number(valor).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}

export function dataBR(iso: string | null | undefined): string {
  if (!iso) return "–";
  const [ano, mes, dia] = iso.split("-");
  if (!ano || !mes || !dia) return "–";
  return `${dia}/${mes}/${ano}`;
}

/** Competência é sempre dia 1, então o dia só polui: mostra mês/ano. */
export function competenciaBR(iso: string | null | undefined): string {
  if (!iso) return "–";
  const [ano, mes] = iso.split("-");
  if (!ano || !mes) return "–";
  return `${mes}/${ano}`;
}

export function hojeISO(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}
