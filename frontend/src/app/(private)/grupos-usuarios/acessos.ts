import { CatalogoPermissoesResponse } from "@/services/domains/grupo-usuario";

/**
 * Regras de marcação da aba Acessos, iguais às que o backend valida ao salvar
 * (docs/permissoes.md, RV4 e RV5):
 *
 * - controle de tela só vale com a tela marcada;
 * - item que exige outro (dependências do catálogo) leva o exigido junto.
 *
 * Telas e controles ficam num conjunto só: os códigos não colidem (telas
 * usam a chave do RoutesEnum, controles têm ponto).
 */

export interface ItemCatalogo {
  codigo: string;
  nome: string;
  tipo: "tela" | "controle";
  /** Tela a que o controle pertence; nulo para tela e para controle geral. */
  tela: string | null;
}

export interface IndiceCatalogo {
  itens: Map<string, ItemCatalogo>;
  controlesDaTela: Map<string, string[]>;
  /** Item → o que ele exige. */
  exige: Map<string, string[]>;
  /** Item → o que exige ele (o caminho inverso, para desmarcar em cascata). */
  exigidoPor: Map<string, string[]>;
}

export interface ResultadoMarcacao {
  marcados: Set<string>;
  /** Itens que mudaram junto, além do clicado. */
  arrastados: string[];
}

export function montarIndice(catalogo: CatalogoPermissoesResponse | null): IndiceCatalogo {
  const itens = new Map<string, ItemCatalogo>();
  const controlesDaTela = new Map<string, string[]>();

  catalogo?.telas.forEach((tela) => {
    itens.set(tela.codigo, { codigo: tela.codigo, nome: tela.nome, tipo: "tela", tela: null });
    controlesDaTela.set(
      tela.codigo,
      tela.controles.map((controle) => controle.codigo),
    );
    tela.controles.forEach((controle) =>
      itens.set(controle.codigo, {
        codigo: controle.codigo,
        nome: controle.nome,
        tipo: "controle",
        tela: tela.codigo,
      }),
    );
  });
  catalogo?.controlesGerais.forEach((controle) =>
    itens.set(controle.codigo, {
      codigo: controle.codigo,
      nome: controle.nome,
      tipo: "controle",
      tela: null,
    }),
  );

  const exige = new Map<string, string[]>();
  const exigidoPor = new Map<string, string[]>();
  Object.entries(catalogo?.dependencias ?? {}).forEach(([item, exigidos]) => {
    exige.set(item, exigidos);
    exigidos.forEach((exigido) =>
      exigidoPor.set(exigido, [...(exigidoPor.get(exigido) ?? []), item]),
    );
  });

  return { itens, controlesDaTela, exige, exigidoPor };
}

/** Marca o item, a tela dele (se for controle de tela) e tudo o que ele exige. */
export function marcar(
  indice: IndiceCatalogo,
  atuais: Set<string>,
  codigo: string,
): ResultadoMarcacao {
  const marcados = new Set(atuais);
  const arrastados: string[] = [];
  const pendentes = [codigo];

  while (pendentes.length > 0) {
    const atual = pendentes.pop()!;
    const item = indice.itens.get(atual);
    if (!item || marcados.has(atual)) continue;

    marcados.add(atual);
    if (atual !== codigo) arrastados.push(atual);
    if (item.tela) pendentes.push(item.tela);
    pendentes.push(...(indice.exige.get(atual) ?? []));
  }

  return { marcados, arrastados };
}

/** Desmarca o item, os controles da tela (se for tela) e tudo o que exige o item. */
export function desmarcar(
  indice: IndiceCatalogo,
  atuais: Set<string>,
  codigo: string,
): ResultadoMarcacao {
  const marcados = new Set(atuais);
  const arrastados: string[] = [];
  const pendentes = [codigo];

  while (pendentes.length > 0) {
    const atual = pendentes.pop()!;
    if (!marcados.has(atual)) continue;

    marcados.delete(atual);
    if (atual !== codigo) arrastados.push(atual);
    pendentes.push(...(indice.controlesDaTela.get(atual) ?? []));
    pendentes.push(...(indice.exigidoPor.get(atual) ?? []));
  }

  return { marcados, arrastados };
}

/** Aplica marcar/desmarcar a vários itens, juntando o que foi arrastado. */
export function aplicarEmLote(
  indice: IndiceCatalogo,
  atuais: Set<string>,
  codigos: string[],
  operacao: typeof marcar,
): ResultadoMarcacao {
  return codigos.reduce<ResultadoMarcacao>(
    (acumulado, codigo) => {
      const resultado = operacao(indice, acumulado.marcados, codigo);
      return {
        marcados: resultado.marcados,
        arrastados: [...acumulado.arrastados, ...resultado.arrastados],
      };
    },
    { marcados: new Set(atuais), arrastados: [] },
  );
}

export function mesmoConjunto(a: Set<string>, b: Set<string>): boolean {
  return a.size === b.size && [...a].every((codigo) => b.has(codigo));
}
