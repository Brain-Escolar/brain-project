import {
  SituacaoAula,
  SituacaoAvaliacao,
  SituacaoProfessor,
} from "@/services/domains/diretor";
import type { Tom } from "../styles";

export {
  diaMes,
  iniciais,
  nomeTurma,
  plural,
} from "@/app/(private)/relatorios/acompanhamento-turma/_components/apresentacao";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** yyyy-MM-dd → Date local, sem deslocamento de fuso. */
function paraData(data: string): Date {
  const [ano, mes, dia] = data.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

/** Hoje, no fuso do navegador, como yyyy-MM-dd. */
export function hojeIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function diaDaSemana(data: string): string {
  return DIAS[paraData(data).getDay()];
}

/** "terça-feira, 20 de outubro" */
export function dataPorExtenso(data: string): string {
  return paraData(data).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

/** yyyy-MM-dd → dd/MM/yyyy */
export function dataCompleta(data: string | null): string {
  if (!data) return "—";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** HH:mm:ss → HH:mm */
export function hora(valor: string | null): string {
  return valor ? valor.slice(0, 5) : "";
}

/** yyyy-MM-ddTHH:mm:ss (fuso da escola) → "20/10 às 14:32" */
export function dataHora(valor: string | null): string {
  if (!valor) return "—";
  const [data, tempo = ""] = valor.split("T");
  const [, mes, dia] = data.split("-");
  return `${dia}/${mes} às ${tempo.slice(0, 5)}`;
}

/** Turma por extenso com a disciplina: "6º ano A · Matemática". */
export function turmaEDisciplina(turma: string, serie: string | null, disciplina?: string | null) {
  const nome = serie && !turma.toLowerCase().includes(serie.toLowerCase()) ? `${serie} ${turma}` : turma;
  return [nome, disciplina].filter(Boolean).join(" · ");
}

/** A partir de quantas aulas sem registro a pendência é crítica. */
const AULAS_PENDENTES_CRITICO = 5;

export function situacaoProfessor(p: {
  situacao: SituacaoProfessor;
  aulasPendentes: number;
  avaliacoesPendentes: number;
}): { rotulo: string; tom: Tom } {
  switch (p.situacao) {
    case "EM_DIA":
      return { rotulo: "Em dia", tom: "success" };
    case "SEM_GRADE":
      return { rotulo: "Sem aulas na grade", tom: "neutral" };
    case "INATIVO":
      return { rotulo: "Inativo", tom: "neutral" };
    case "PENDENTE":
      if (p.aulasPendentes > 0) {
        return {
          rotulo: `${p.aulasPendentes} ${p.aulasPendentes === 1 ? "aula sem registro" : "aulas sem registro"}`,
          tom: p.aulasPendentes >= AULAS_PENDENTES_CRITICO ? "error" : "warning",
        };
      }
      return {
        rotulo: p.avaliacoesPendentes === 1 ? "1 avaliação em atraso" : `${p.avaliacoesPendentes} avaliações em atraso`,
        tom: "warning",
      };
  }
}

export const SITUACAO_AULA: Record<SituacaoAula, { rotulo: string; tom: Tom }> = {
  REGISTRADA: { rotulo: "Registrada", tom: "success" },
  PENDENTE: { rotulo: "Sem registro", tom: "warning" },
  PREVISTA: { rotulo: "A realizar", tom: "neutral" },
};

export const SITUACAO_AVALIACAO: Record<SituacaoAvaliacao, { rotulo: string; tom: Tom }> = {
  LANCADA: { rotulo: "Lançada", tom: "success" },
  NO_PRAZO: { rotulo: "No prazo", tom: "info" },
  ATRASADA: { rotulo: "Em atraso", tom: "error" },
  AGENDADA: { rotulo: "Agendada", tom: "neutral" },
};

/** Cor do ponto de um dia: sem aula, com pendência, tudo registrado ou ainda por acontecer. */
export function tomDoDia(d: { aulas: number; registradas: number; pendentes: number }): Tom {
  if (d.aulas === 0) return "neutral";
  if (d.pendentes > 0) return "warning";
  if (d.registradas === d.aulas) return "success";
  return "primary";
}

export function tomProgresso(feitas: number, total: number): Tom {
  if (total === 0 || feitas >= total) return "success";
  return feitas / total < 0.7 ? "error" : "warning";
}

export function porcentagem(feitas: number, total: number): number {
  return total === 0 ? 0 : Math.round((feitas / total) * 100);
}
