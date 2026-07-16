"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import GradeOutlinedIcon from "@mui/icons-material/GradeOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";

import PageScaffold from "@/components/pageScaffold/PageScaffold";
import Badge, { BadgeTone } from "@/components/badge";
import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import { useRelatorios } from "@/hooks/useRelatorios";
import { RelatorioSituacao } from "@/services/domains/estudante/response";
import * as S from "./styles";

type ReportType = "notas" | "freq";

const SITUACAO_LABEL: Record<RelatorioSituacao, string> = {
  APROVADO: "Aprovado",
  REPROVADO: "Reprovado",
  EM_ANDAMENTO: "Em andamento",
};

const SITUACAO_TONE: Record<RelatorioSituacao, BadgeTone> = {
  APROVADO: "success",
  REPROVADO: "error",
  EM_ANDAMENTO: "warning",
};

function situacaoIcon(situacao: RelatorioSituacao) {
  if (situacao === "APROVADO") return <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />;
  if (situacao === "REPROVADO") return <CancelOutlinedIcon sx={{ fontSize: 14 }} />;
  return <HourglassEmptyOutlinedIcon sx={{ fontSize: 14 }} />;
}

export default function RelatoriosContent() {
  const { relatorio, loading, error } = useRelatorios();
  const [report, setReport] = useState<ReportType>("notas");

  if (loading) return <LoadingComponent />;
  if (error || !relatorio) {
    return <BrainResultNotFound message="Não foi possível carregar os relatórios." />;
  }

  const {
    gradingScale,
    resumo,
    aluno,
    periodos,
    disciplinas,
    frequenciaMinima,
    limiteFaltas,
    percentualLimiteFaltas,
  } = relatorio;

  const fmtNota = (valor: number | null | undefined) =>
    valor == null ? "–" : valor.toFixed(gradingScale.decimalPlaces).replace(".", ",");
  const fmtFreq = (valor: number | null | undefined) =>
    valor == null ? "–" : `${valor.toFixed(1).replace(".", ",")}%`;
  const abaixo = (valor: number | null | undefined) =>
    valor != null && valor < gradingScale.passingValue;
  const emAlertaFreq = (valor: number | null | undefined) =>
    valor != null && valor < frequenciaMinima;

  const situacaoFinal = resumo.situacaoFinal;
  const recupTone: S.KpiTone = resumo.emRecuperacao > 0 ? "warning" : "success";
  const finalTone: S.KpiTone =
    situacaoFinal === "APROVADO" ? "success" : situacaoFinal === "REPROVADO" ? "error" : "warning";
  const alertaTone: S.KpiTone = resumo.emAlerta > 0 ? "warning" : "success";

  const totalAulas =
    percentualLimiteFaltas > 0 ? Math.round((limiteFaltas * 100) / percentualLimiteFaltas) : null;

  const subtitulo = [
    aluno.serie,
    `Ano letivo ${relatorio.anoAcademico}`,
    gradingScale.label,
    `Média para aprovação: ${fmtNota(relatorio.notaAprovacao)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const periodHeaders = (variant: ReportType) =>
    periodos.map((p) => (
      <th key={`${variant}-${p.id}`} className={p.isCurrent ? "cur" : ""}>
        {p.name}
      </th>
    ));

  return (
    <PageScaffold
      title="Relatórios"
      description={subtitulo}
      actions={
        <Button variant="outlined" startIcon={<DownloadOutlinedIcon />}>
          Exportar relatório
        </Button>
      }
    >
      <S.Container>
        {/* Seletor de relatório */}
        <S.Chips role="tablist" aria-label="Tipo de relatório">
          <S.Chip
            role="tab"
            aria-selected={report === "notas"}
            $selected={report === "notas"}
            onClick={() => setReport("notas")}
          >
            <GradeOutlinedIcon />
            Notas
          </S.Chip>
          <S.Chip
            role="tab"
            aria-selected={report === "freq"}
            $selected={report === "freq"}
            onClick={() => setReport("freq")}
          >
            <EventAvailableOutlinedIcon />
            Frequência
          </S.Chip>
          <S.Chip disabled>
            <StickyNote2OutlinedIcon />
            Anotações
            <S.ChipSoon>Em breve</S.ChipSoon>
          </S.Chip>
        </S.Chips>

        {/* ============ RELATÓRIO: NOTAS ============ */}
        {report === "notas" && (
          <>
            <S.KpiGrid>
              <S.KpiCard>
                <S.KpiHead>
                  <S.KpiLabel>Média geral anual</S.KpiLabel>
                  <S.KpiIcon $tone="primary">
                    <GradeOutlinedIcon />
                  </S.KpiIcon>
                </S.KpiHead>
                <S.KpiValue>{fmtNota(resumo.mediaGeral)}</S.KpiValue>
              </S.KpiCard>

              <S.KpiCard>
                <S.KpiHead>
                  <S.KpiLabel>Em recuperação</S.KpiLabel>
                  <S.KpiIcon $tone={recupTone}>
                    <HistoryEduOutlinedIcon />
                  </S.KpiIcon>
                </S.KpiHead>
                <S.KpiValue>{resumo.emRecuperacao}</S.KpiValue>
              </S.KpiCard>

              <S.KpiCard>
                <S.KpiHead>
                  <S.KpiLabel>Disciplinas aprovadas</S.KpiLabel>
                  <S.KpiIcon $tone="success">
                    <CheckCircleOutlineIcon />
                  </S.KpiIcon>
                </S.KpiHead>
                <S.KpiValue>
                  {resumo.disciplinasAprovadas}/{resumo.totalDisciplinas}
                </S.KpiValue>
              </S.KpiCard>

              <S.KpiCard>
                <S.KpiHead>
                  <S.KpiLabel>Situação final</S.KpiLabel>
                  <S.KpiIcon $tone={finalTone}>{situacaoIcon(situacaoFinal)}</S.KpiIcon>
                </S.KpiHead>
                <S.KpiValue>{SITUACAO_LABEL[situacaoFinal]}</S.KpiValue>
              </S.KpiCard>
            </S.KpiGrid>

            <S.TableWrap>
              <S.TableScroll>
                <S.Table>
                  <thead>
                    <tr>
                      <th className="left">Disciplina</th>
                      {periodHeaders("notas")}
                      <th className="sep">Nota anual</th>
                      <th>Rec./Aval. esp.</th>
                      <th>Nota final</th>
                      <th className="sep">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disciplinas.map((d) => {
                      const porPeriodo = new Map(d.periodos.map((np) => [np.periodoId, np]));
                      return (
                        <tr key={d.disciplinaId}>
                          <S.DisciplinaCell className="disc">{d.nome}</S.DisciplinaCell>
                          {periodos.map((p) => {
                            const np = porPeriodo.get(p.id);
                            return (
                              <td key={p.id} className={p.isCurrent ? "cur" : ""}>
                                <S.Nota $bad={abaixo(np?.nota ?? null)}>
                                  {fmtNota(np?.nota ?? null)}
                                </S.Nota>
                              </td>
                            );
                          })}
                          <td className="sep">
                            <S.Nota $bad={abaixo(d.notaAnual)}>{fmtNota(d.notaAnual)}</S.Nota>
                          </td>
                          <td>
                            <S.Rec>{fmtNota(d.recuperacao)}</S.Rec>
                          </td>
                          <td>
                            {d.notaFinal == null ? (
                              <S.Rec>–</S.Rec>
                            ) : (
                              <S.GradePill $bad={d.situacao === "REPROVADO"}>
                                {fmtNota(d.notaFinal)}
                              </S.GradePill>
                            )}
                          </td>
                          <td className="sep">
                            <Badge $tone={SITUACAO_TONE[d.situacao]}>
                              {situacaoIcon(d.situacao)}
                              {SITUACAO_LABEL[d.situacao]}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </S.Table>
              </S.TableScroll>
            </S.TableWrap>

            <S.Legend>
              <span>
                <S.LegendDot $variant="bad" />
                Nota abaixo da média ({fmtNota(gradingScale.passingValue)})
              </span>
              <span>
                <S.LegendDot $variant="current" />
                Período atual
              </span>
              <span>Rec./Aval. esp.: nota de recuperação ou avaliação especial</span>
            </S.Legend>
          </>
        )}

        {/* ============ RELATÓRIO: FREQUÊNCIA ============ */}
        {report === "freq" && (
          <>
            <S.KpiGrid>
              <S.KpiCard>
                <S.KpiHead>
                  <S.KpiLabel>Frequência geral</S.KpiLabel>
                  <S.KpiIcon $tone="primary">
                    <EventAvailableOutlinedIcon />
                  </S.KpiIcon>
                </S.KpiHead>
                <S.KpiValue>{fmtFreq(resumo.frequenciaGeral)}</S.KpiValue>
              </S.KpiCard>

              <S.KpiCard>
                <S.KpiHead>
                  <S.KpiLabel>Total de faltas</S.KpiLabel>
                  <S.KpiIcon $tone="primary">
                    <EventBusyOutlinedIcon />
                  </S.KpiIcon>
                </S.KpiHead>
                <S.KpiValue>{resumo.totalFaltas}</S.KpiValue>
              </S.KpiCard>

              <S.KpiCard>
                <S.KpiHead>
                  <S.KpiLabel>Limite por disciplina</S.KpiLabel>
                  <S.KpiIcon $tone="success">
                    <RuleOutlinedIcon />
                  </S.KpiIcon>
                </S.KpiHead>
                <S.KpiValue>{limiteFaltas} faltas</S.KpiValue>
              </S.KpiCard>

              <S.KpiCard>
                <S.KpiHead>
                  <S.KpiLabel>Em alerta</S.KpiLabel>
                  <S.KpiIcon $tone={alertaTone}>
                    <WarningAmberOutlinedIcon />
                  </S.KpiIcon>
                </S.KpiHead>
                <S.KpiValue>{resumo.emAlerta}</S.KpiValue>
              </S.KpiCard>
            </S.KpiGrid>

            <S.TableWrap>
              <S.TableScroll>
                <S.Table>
                  <thead>
                    <tr>
                      <th className="left">Disciplina</th>
                      {periodHeaders("freq")}
                      <th className="sep">Total de faltas</th>
                      <th>Frequência</th>
                      <th style={{ minWidth: 150 }} aria-label="Barra de frequência" />
                      <th className="sep">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disciplinas.map((d) => {
                      const porPeriodo = new Map(d.periodos.map((np) => [np.periodoId, np]));
                      const alerta = emAlertaFreq(d.frequencia);
                      return (
                        <tr key={d.disciplinaId}>
                          <S.DisciplinaCell className="disc">{d.nome}</S.DisciplinaCell>
                          {periodos.map((p) => {
                            const np = porPeriodo.get(p.id);
                            return (
                              <td key={p.id} className={p.isCurrent ? "cur" : ""}>
                                <S.Faltas>{np?.faltas ?? 0}</S.Faltas>
                              </td>
                            );
                          })}
                          <td className="sep">{d.totalFaltas}</td>
                          <td>
                            <S.Faltas $alert={alerta}>{fmtFreq(d.frequencia)}</S.Faltas>
                          </td>
                          <td>
                            <S.Bar>
                              <S.BarFill $pct={d.frequencia ?? 0} $alert={alerta} />
                            </S.Bar>
                          </td>
                          <td className="sep">
                            {d.frequencia == null ? (
                              <S.Rec>–</S.Rec>
                            ) : alerta ? (
                              <Badge $tone="warning">
                                <WarningAmberOutlinedIcon sx={{ fontSize: 14 }} />
                                Atenção
                              </Badge>
                            ) : (
                              <Badge $tone="success">
                                <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
                                Regular
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </S.Table>
              </S.TableScroll>
            </S.TableWrap>

            <S.Legend>
              <span>
                <S.LegendDot $variant="current" />
                Período atual
              </span>
              <span>
                Limite de faltas: {percentualLimiteFaltas}% das aulas
                {totalAulas != null ? ` (${limiteFaltas} de ${totalAulas})` : ""} · Atenção:
                frequência abaixo de {fmtFreq(frequenciaMinima)}
              </span>
            </S.Legend>
          </>
        )}
      </S.Container>
    </PageScaffold>
  );
}
