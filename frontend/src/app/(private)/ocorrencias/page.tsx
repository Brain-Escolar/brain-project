"use client";

import { useMemo, useState } from "react";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import AssignmentLateOutlinedIcon from "@mui/icons-material/AssignmentLateOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

import PageScaffold from "@/components/pageScaffold/PageScaffold";
import Badge, { BadgeTone } from "@/components/badge";
import KpiCard from "@/components/kpiCard";
import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import { cssVarColor } from "@/styles";
import { useAlunoSelecionado } from "@/contexts/AlunoSelecionadoContext";
import { useOcorrenciasAluno } from "@/hooks/useOcorrenciasAluno";
import * as S from "./styles";

/**
 * Tipos vindos do enum Anotacoes do backend (getDescricao()).
 * Qualquer tipo fora desta tabela cai no visual neutro de "Outros".
 */
const TIPOS: Record<string, { tone: BadgeTone; cor: string }> = {
  Atraso: { tone: "warning", cor: cssVarColor("warning") },
  "Conversa em sala de aula": { tone: "info", cor: cssVarColor("info") },
  "Não entregou o dever de casa": { tone: "info", cor: cssVarColor("info") },
  "Não fez a atividade": { tone: "info", cor: cssVarColor("info") },
  "Não entregou o trabalho": { tone: "info", cor: cssVarColor("info") },
  "Sem materiais": { tone: "neutral", cor: cssVarColor("textTertiary") },
};

const CHIPS = [
  "Todos",
  "Atraso",
  "Conversa em sala de aula",
  "Não entregou o dever de casa",
  "Sem materiais",
];

function visual(tipo: string) {
  return TIPOS[tipo] ?? { tone: "neutral" as BadgeTone, cor: cssVarColor("textTertiary") };
}

function formatarDia(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split("-").map(Number);
  if (!ano || !mes || !dia) return dataIso;
  const MESES = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  return `${String(dia).padStart(2, "0")} de ${MESES[mes - 1]}`;
}

export default function OcorrenciasPage() {
  const { alunoAtual, isLoading: carregandoAlunos } = useAlunoSelecionado();
  const { ocorrencias, loading, error } = useOcorrenciasAluno();
  const [filtro, setFiltro] = useState("Todos");

  const filtradas = useMemo(
    () => (filtro === "Todos" ? ocorrencias : ocorrencias.filter((o) => o.tipoAnotacao === filtro)),
    [ocorrencias, filtro],
  );

  const grupos = useMemo(() => {
    const mapa = new Map<string, typeof filtradas>();
    filtradas.forEach((o) => {
      const atual = mapa.get(o.data) ?? [];
      mapa.set(o.data, [...atual, o]);
    });
    return Array.from(mapa.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtradas]);

  const contar = (tipo: string) => ocorrencias.filter((o) => o.tipoAnotacao === tipo).length;
  const atrasos = contar("Atraso");
  const conversas = contar("Conversa em sala de aula");
  const deveres = contar("Não entregou o dever de casa");

  if (carregandoAlunos || loading) return <LoadingComponent />;
  if (!alunoAtual) {
    return <BrainResultNotFound message="Nenhum aluno vinculado ao seu cadastro." />;
  }
  if (error) {
    return <BrainResultNotFound message="Não foi possível carregar as ocorrências." />;
  }

  const primeiroNome = (alunoAtual.nomeSocial || alunoAtual.nome || "").split(" ")[0];

  return (
    <PageScaffold
      title={`Ocorrências de ${primeiroNome}`}
      description="Registros lançados pelos professores nos últimos 7 dias"
    >
      <S.Filtros>
        {CHIPS.map((chip) => (
          <S.Chip
            key={chip}
            type="button"
            $ativo={filtro === chip}
            onClick={() => setFiltro(chip)}
            aria-pressed={filtro === chip}
          >
            {chip}
          </S.Chip>
        ))}
      </S.Filtros>

      <S.ContagemGrid>
        <KpiCard rotulo="Atrasos" valor={atrasos} icone={<ScheduleOutlinedIcon />} tone="warning" />
        <KpiCard rotulo="Conversa em sala" valor={conversas} icone={<ForumOutlinedIcon />} tone="info" />
        <KpiCard
          rotulo="Dever de casa"
          valor={deveres}
          icone={<AssignmentLateOutlinedIcon />}
          tone="info"
        />
        <KpiCard
          rotulo="Outros"
          valor={ocorrencias.length - atrasos - conversas - deveres}
          icone={<MoreHorizOutlinedIcon />}
          tone="neutral"
        />
      </S.ContagemGrid>

      {grupos.length === 0 ? (
        <BrainResultNotFound
          message={
            filtro === "Todos"
              ? "Nenhuma ocorrência registrada no período."
              : `Nenhuma ocorrência do tipo "${filtro}" no período.`
          }
          icon={<VerifiedOutlinedIcon />}
        />
      ) : (
        grupos.map(([dia, itens]) => (
          <S.Grupo key={dia}>
            <S.GrupoDia>{formatarDia(dia)}</S.GrupoDia>
            <S.Timeline>
              {itens.map((o, i) => {
                const v = visual(o.tipoAnotacao);
                return (
                  <S.Item key={`${dia}-${i}`}>
                    <S.Marcador $cor={v.cor} />
                    <S.ItemTopo>
                      <Badge $tone={v.tone}>{o.tipoAnotacao}</Badge>
                      <S.ItemMeta>{o.disciplina}</S.ItemMeta>
                    </S.ItemTopo>
                    {o.observacao && <S.ItemDesc>{o.observacao}</S.ItemDesc>}
                  </S.Item>
                );
              })}
            </S.Timeline>
          </S.Grupo>
        ))
      )}
    </PageScaffold>
  );
}
