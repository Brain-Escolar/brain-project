/** "2026-09-24" -> "24/09/2026", sem passar por Date (evita cair um dia no fuso). */
export function formatarDataLocal(iso?: string | null): string | null {
  if (!iso) return null;
  const [ano, mes, dia] = iso.split("T")[0].split("-");
  if (!ano || !mes || !dia) return null;
  return `${dia}/${mes}/${ano}`;
}

/** Instant ISO -> data local pt-BR. */
export function formatarInstante(iso?: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export const ACCEPT_DOCUMENTO = ".pdf,.jpg,.jpeg,.png";
export const ACCEPT_FOTO = ".jpg,.jpeg,.png";
