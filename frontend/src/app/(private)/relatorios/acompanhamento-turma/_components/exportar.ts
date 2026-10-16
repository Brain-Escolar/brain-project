/** Exportações do acompanhamento: planilha (CSV com BOM, abre no Excel) e PDF (impressão do navegador). */

/** Aspas dobradas escapam aspas dentro de um campo CSV. */
function celulaCsv(valor: string | number): string {
  return `"${String(valor).split(String.fromCharCode(34)).join(String.fromCharCode(34, 34))}"`;
}

export function exportarCsv(nomeArquivo: string, linhas: (string | number)[][]) {
  const csv = "\ufeff" + linhas.map((l) => l.map(celulaCsv).join(";")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = `${nomeArquivo}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

const ID_RAIZ = "acp-print-root";
const ID_ESTILO = "acp-print-style";
const CLASSE_IMPRIMINDO = "acp-printing";

const ESTILO_IMPRESSAO = `
  @media screen { #${ID_RAIZ} { display: none; } }
  @media print {
    @page { size: A4 landscape; margin: 12mm; }
    html.${CLASSE_IMPRIMINDO} body > *:not(#${ID_RAIZ}) { display: none !important; }
    html.${CLASSE_IMPRIMINDO}, html.${CLASSE_IMPRIMINDO} body { background: #fff !important; }
    #${ID_RAIZ} * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-shadow: none !important; }
    #${ID_RAIZ} tr { break-inside: avoid; }
    #${ID_RAIZ} [data-noprint] { display: none !important; }
  }
`;

/**
 * Imprime só o relatório: clona o nó num contêiner à parte, esconde o resto
 * da página durante a impressão e desfaz tudo no `afterprint`. O usuário
 * escolhe "Salvar como PDF" no diálogo do navegador.
 */
export function exportarPdf(elemento: HTMLElement | null, titulo: string) {
  if (!elemento) return;

  if (!document.getElementById(ID_ESTILO)) {
    const estilo = document.createElement("style");
    estilo.id = ID_ESTILO;
    estilo.textContent = ESTILO_IMPRESSAO;
    document.head.appendChild(estilo);
  }

  const raiz = document.createElement("div");
  raiz.id = ID_RAIZ;
  const cabecalho = document.createElement("div");
  cabecalho.style.cssText =
    "display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #1E4BC8;" +
    "padding-bottom:8px;margin-bottom:14px;font-family:inherit";
  const nome = document.createElement("div");
  nome.style.cssText = "font-size:18px;font-weight:700";
  nome.textContent = "Acompanhamento por turma";
  const meta = document.createElement("div");
  meta.style.cssText = "font-size:11px;color:#475569";
  meta.textContent = `${titulo} · emitido em ${new Date().toLocaleDateString("pt-BR")}`;
  cabecalho.append(nome, meta);
  raiz.append(cabecalho, elemento.cloneNode(true));

  document.body.appendChild(raiz);
  document.documentElement.classList.add(CLASSE_IMPRIMINDO);
  const tituloOriginal = document.title;
  document.title = `Acompanhamento ${titulo}`;

  const limpar = () => {
    raiz.remove();
    document.documentElement.classList.remove(CLASSE_IMPRIMINDO);
    document.title = tituloOriginal;
    window.removeEventListener("afterprint", limpar);
  };
  window.addEventListener("afterprint", limpar);
  setTimeout(() => window.print(), 60);
}
