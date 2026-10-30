/**
 * Ano letivo que a pessoa escolheu ver no seletor da barra superior. Vai em
 * toda requisição no cabeçalho `X-Ano-Letivo`; sem ele, o backend usa o ano
 * corrente.
 *
 * Fica no sessionStorage, não no localStorage, de propósito: quem olhou 2025
 * ontem não pode abrir o sistema hoje ainda preso em 2025 sem perceber. Cada
 * sessão começa no ano corrente.
 */
const STORAGE_KEY = "brain.anoLetivo";

export const CABECALHO_ANO_LETIVO = "X-Ano-Letivo";

export function lerAnoLetivoSelecionado(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const valor = window.sessionStorage.getItem(STORAGE_KEY);
    return valor && /^\d{4}$/.test(valor) ? Number(valor) : null;
  } catch {
    return null;
  }
}

/** `null` volta ao ano corrente. */
export function salvarAnoLetivoSelecionado(ano: number | null) {
  try {
    if (ano == null) {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(STORAGE_KEY, String(ano));
    }
  } catch {
    // Sem storage, a escolha vale só até recarregar a página.
  }
}
