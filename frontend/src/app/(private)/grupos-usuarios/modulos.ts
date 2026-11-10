import { ModuloResponse } from "@/services/domains/grupo-usuario";

/**
 * Agrupamento das telas por módulo e submódulo, na ordem do menu
 * (docs/permissoes.md, D34). Só organiza a tela de grupos: liberar continua
 * sendo tela a tela, e o menu continua no routesConfig.
 */

export const SEM_MODULO = "Outras telas";

interface ComModulo {
  nome: string;
  modulo: ModuloResponse | null;
}

/** Uma seção da lista: um módulo de topo (ou as telas sem módulo, no fim). */
export interface SecaoDeTelas<T> {
  chave: string;
  titulo: string;
  /** Telas direto no módulo, sem submódulo; todas, na seção sem módulo. */
  telas: T[];
  submodulos: { chave: string; titulo: string; telas: T[] }[];
}

/** Do topo para baixo: [Cadastros, Pessoas]. Vazio para a tela sem módulo. */
export function caminhoDoModulo(modulo: ModuloResponse | null): ModuloResponse[] {
  const caminho: ModuloResponse[] = [];
  for (let atual = modulo; atual; atual = atual.pai) caminho.unshift(atual);
  return caminho;
}

/** "Cadastros › Pessoas", ou "Outras telas". */
export function nomeDoModulo(modulo: ModuloResponse | null): string {
  const caminho = caminhoDoModulo(modulo);
  return caminho.length > 0 ? caminho.map((m) => m.nome).join(" › ") : SEM_MODULO;
}

/**
 * Ordem do menu: módulos pela ordem, as telas direto no módulo antes dos
 * submódulos dele, e as telas sem módulo por último. Dentro de cada um, por nome.
 */
export function compararPorModulo(a: ComModulo, b: ComModulo): number {
  const caminhoA = caminhoDoModulo(a.modulo);
  const caminhoB = caminhoDoModulo(b.modulo);
  if ((caminhoA.length === 0) !== (caminhoB.length === 0)) return caminhoA.length === 0 ? 1 : -1;
  for (let nivel = 0; nivel < Math.max(caminhoA.length, caminhoB.length); nivel++) {
    const moduloA = caminhoA[nivel];
    const moduloB = caminhoB[nivel];
    if (!moduloA) return -1;
    if (!moduloB) return 1;
    if (moduloA.codigo !== moduloB.codigo) {
      return moduloA.ordem - moduloB.ordem || moduloA.nome.localeCompare(moduloB.nome, "pt-BR");
    }
  }
  return a.nome.localeCompare(b.nome, "pt-BR");
}

/** Seções na ordem do menu, sem as vazias. */
export function agruparPorModulo<T extends ComModulo>(telas: T[]): SecaoDeTelas<T>[] {
  const secoes: SecaoDeTelas<T>[] = [];
  for (const tela of [...telas].sort(compararPorModulo)) {
    const [topo, sub] = caminhoDoModulo(tela.modulo);
    const chave = topo?.codigo ?? SEM_MODULO;
    let secao = secoes[secoes.length - 1];
    if (secao?.chave !== chave) {
      secao = { chave, titulo: topo?.nome ?? SEM_MODULO, telas: [], submodulos: [] };
      secoes.push(secao);
    }
    if (!sub) {
      secao.telas.push(tela);
      continue;
    }
    let submodulo = secao.submodulos[secao.submodulos.length - 1];
    if (submodulo?.chave !== sub.codigo) {
      submodulo = { chave: sub.codigo, titulo: sub.nome, telas: [] };
      secao.submodulos.push(submodulo);
    }
    submodulo.telas.push(tela);
  }
  return secoes;
}
