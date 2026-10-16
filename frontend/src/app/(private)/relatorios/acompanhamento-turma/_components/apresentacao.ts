import { AcompanhamentoTurmaResponse, TurmaFiltroResponse } from "@/services/domains/diretor";
import { formatarDecimal } from "@/utils/formatoNumero";
import type { Tom } from "../styles";

/** "6º ano" + "A" → "6º ano A"; se o nome da turma já traz a série, usa só ele. */
export function nomeTurma(turma: { nome: string; serie: string }): string {
  return turma.nome.toLowerCase().includes(turma.serie.toLowerCase())
    ? turma.nome
    : `${turma.serie} ${turma.nome}`;
}

export function rotuloTurma(turma: TurmaFiltroResponse): string {
  return [nomeTurma(turma), turma.turno].filter(Boolean).join(" · ");
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return (
    (partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")
  ).toUpperCase();
}

/** yyyy-MM-dd → dd/MM, sem passar por Date (evita deslocamento de fuso). */
export function diaMes(data: string | null): string {
  if (!data) return "—";
  const [, mes, dia] = data.split("-");
  return `${dia}/${mes}`;
}

export function tomNota(nota: number | null, minima: number): Tom {
  if (nota == null) return "neutral";
  return nota < minima ? "error" : "success";
}

/** Abaixo do mínimo é erro; até 10 p.p. acima ainda é alerta. */
export function tomFrequencia(frequencia: number | null, minima: number): Tom | undefined {
  if (frequencia == null) return "neutral";
  if (frequencia < minima) return "error";
  if (frequencia < minima + 10) return "warning";
  return undefined;
}

export function plural(n: number, singular: string, pluralForma: string): string {
  return `${n} ${n === 1 ? singular : pluralForma}`;
}

export function descricaoCriterios(dados: AcompanhamentoTurmaResponse): string {
  const c = dados.criterios;
  return (
    `Atenção: média < ${formatarDecimal(c.mediaMinima)}, freq. < ${formatarDecimal(c.frequenciaMinima, 0)}%, ` +
    `${c.atrasosPorPeriodo}+ atrasos ou ${c.anotacoesPorPeriodo}+ anotações por período`
  );
}

export function capitalizar(texto: string): string {
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : texto;
}
