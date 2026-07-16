"use client";

import PageScaffold from "@/components/pageScaffold/PageScaffold";
import Badge, { BadgeTone } from "@/components/badge";
import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import { useBoletim } from "@/hooks/useBoletim";
import { BoletimSituacao } from "@/services/domains/estudante/response";
import { Button } from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import { Fragment } from "react";
import * as S from "./styles";

const SITUACAO_LABEL: Record<BoletimSituacao, string> = {
  APROVADO: "Aprovado",
  REPROVADO: "Reprovado",
  EM_ANDAMENTO: "Em andamento",
};

const SITUACAO_TONE: Record<BoletimSituacao, BadgeTone> = {
  APROVADO: "success",
  REPROVADO: "error",
  EM_ANDAMENTO: "warning",
};

function situacaoIcon(situacao: BoletimSituacao) {
  if (situacao === "APROVADO") return <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />;
  if (situacao === "REPROVADO") return <CancelOutlinedIcon sx={{ fontSize: 14 }} />;
  return <HourglassEmptyOutlinedIcon sx={{ fontSize: 14 }} />;
}

export default function BoletimContent() {
  const { boletim, loading, error } = useBoletim();

  if (loading) return <LoadingComponent />;
  if (error || !boletim) {
    return <BrainResultNotFound message="Não foi possível carregar o boletim." />;
  }

  const { gradingScale, resumo, aluno, periodos, disciplinas } = boletim;

  const fmtNota = (valor: number | null | undefined) =>
    valor == null ? "–" : valor.toFixed(gradingScale.decimalPlaces).replace(".", ",");
  const abaixo = (valor: number | null | undefined) =>
    valor != null && valor < gradingScale.passingValue;

  const situacaoFinal = resumo.situacaoFinal;
  const recupTone: S.KpiTone = resumo.emRecuperacao > 0 ? "warning" : "success";
  const finalTone: S.KpiTone =
    situacaoFinal === "APROVADO" ? "success" : situacaoFinal === "REPROVADO" ? "error" : "warning";

  const subtitulo = [
    aluno.serie,
    `Ano letivo ${boletim.anoAcademico}`,
    gradingScale.label,
    `Média para aprovação: ${fmtNota(boletim.notaAprovacao)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <PageScaffold
      title="Boletim"
      description={subtitulo}
      actions={
        <Button variant="outlined" startIcon={<DownloadOutlinedIcon />}>
          Exportar boletim
        </Button>
      }
    >
      <S.Container>
        {/* KPIs */}
        <S.KpiGrid>
          <S.KpiCard>
            <S.KpiHead>
              <S.KpiLabel>Média geral anual</S.KpiLabel>
              <S.KpiIcon $tone="primary">
                <StarBorderRoundedIcon />
              </S.KpiIcon>
            </S.KpiHead>
            <S.KpiValue>{fmtNota(resumo.mediaGeral)}</S.KpiValue>
          </S.KpiCard>

          <S.KpiCard>
            <S.KpiHead>
              <S.KpiLabel>Frequência</S.KpiLabel>
              <S.KpiIcon $tone="success">
                <EventAvailableOutlinedIcon />
              </S.KpiIcon>
            </S.KpiHead>
            <S.KpiValue>{resumo.frequenciaGeral == null ? "–" : `${resumo.frequenciaGeral}%`}</S.KpiValue>
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
              <S.KpiLabel>Situação final</S.KpiLabel>
              <S.KpiIcon $tone={finalTone}>{situacaoIcon(situacaoFinal)}</S.KpiIcon>
            </S.KpiHead>
            <S.KpiValue>{SITUACAO_LABEL[situacaoFinal]}</S.KpiValue>
          </S.KpiCard>
        </S.KpiGrid>

        {/* Tabela */}
        <S.TableWrap>
          <S.TableScroll>
            <S.Table>
              <thead>
                <tr>
                  <th rowSpan={2}>Disciplina</th>
                  {periodos.map((p) => (
                    <th key={p.id} colSpan={2} className={p.isCurrent ? "group current" : "group"}>
                      {p.name}
                    </th>
                  ))}
                  <th colSpan={3} className="group">
                    Média
                  </th>
                  <th colSpan={2} className="group">
                    Total
                  </th>
                </tr>
                <tr>
                  {periodos.map((p) => (
                    <Fragment key={p.id}>
                      <th className={p.isCurrent ? "group current" : "group"}>Nota</th>
                      <th className={p.isCurrent ? "current" : ""}>Faltas</th>
                    </Fragment>
                  ))}
                  <th className="group">Nota anual</th>
                  <th>Rec./Aval. esp.</th>
                  <th>Nota final</th>
                  <th className="group">Faltas</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {disciplinas.map((d) => {
                  const porPeriodo = new Map(d.periodos.map((np) => [np.periodoId, np]));
                  return (
                    <tr key={d.disciplinaId}>
                      <S.DisciplinaCell>{d.nome}</S.DisciplinaCell>
                      {periodos.map((p) => {
                        const np = porPeriodo.get(p.id);
                        return (
                          <Fragment key={p.id}>
                            <td className={p.isCurrent ? "group current" : "group"}>
                              <S.Nota $bad={abaixo(np?.nota ?? null)}>{fmtNota(np?.nota ?? null)}</S.Nota>
                            </td>
                            <td className={p.isCurrent ? "current" : ""}>
                              <S.Faltas>{np?.faltas ?? 0}</S.Faltas>
                            </td>
                          </Fragment>
                        );
                      })}
                      <td className="group">
                        <S.Nota $bad={abaixo(d.notaAnual)}>{fmtNota(d.notaAnual)}</S.Nota>
                      </td>
                      <td>
                        <S.Rec>{fmtNota(d.recuperacao)}</S.Rec>
                      </td>
                      <td>
                        {d.notaFinal == null ? (
                          <S.Rec>–</S.Rec>
                        ) : (
                          <S.GradePill $bad={d.situacao === "REPROVADO"}>{fmtNota(d.notaFinal)}</S.GradePill>
                        )}
                      </td>
                      <td className="group">
                        <S.Faltas>{d.totalFaltas}</S.Faltas>
                      </td>
                      <td>
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

        {/* Legenda */}
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
      </S.Container>
    </PageScaffold>
  );
}
