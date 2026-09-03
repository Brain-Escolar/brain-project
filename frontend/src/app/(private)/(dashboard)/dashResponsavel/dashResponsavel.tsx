"use client";

import { Box } from "@mui/material";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import GradeOutlinedIcon from "@mui/icons-material/GradeOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ReportGmailerrorredOutlinedIcon from "@mui/icons-material/ReportGmailerrorredOutlined";

import BrainyMascot from "@/components/brainyMascot/BrainyMascot";
import LayoutColumns from "@/components/layoutColumns/layoutColumns";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import PageTitle from "@/components/pageTitle/pageTitle";
import KpiCard from "@/components/kpiCard";
import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import type { BadgeTone } from "@/components/badge";
import { useAuth } from "@/hooks/useAuth";
import { useAlunoSelecionado } from "@/contexts/AlunoSelecionadoContext";
import { useResumoAluno } from "@/hooks/useResumoAluno";
import { useGradeHorariaAluno } from "@/hooks/useGradeHorariaAluno";
import * as S from "./styles";

/** Dias da semana como o backend os devolve (DiaSemana.name()). */
const DIA_ENUM = [
  "DOMINGO",
  "SEGUNDA",
  "TERCA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SABADO",
] as const;

function fmtNota(valor: number | null | undefined, casas = 1): string {
  if (valor == null) return "–";
  return valor.toFixed(casas).replace(".", ",");
}

function fmtPercentual(valor: number | null | undefined): string {
  if (valor == null) return "–";
  return `${Math.round(valor)}%`;
}

function prazoRelativo(prazoIso: string): string {
  const [ano, mes, dia] = prazoIso.split("-").map(Number);
  const prazo = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  const dias = Math.round(
    (prazo.setHours(0, 0, 0, 0) - hoje.setHours(0, 0, 0, 0)) / 86_400_000,
  );
  if (dias === 0) return "Hoje";
  if (dias === 1) return "Amanhã";
  const abrev = format(new Date(ano, mes - 1, dia), "EEEEEE", { locale: ptBR });
  return `${abrev.charAt(0).toUpperCase() + abrev.slice(1)} · ${format(new Date(ano, mes - 1, dia), "dd/MM")}`;
}

function horaEmMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export default function DashResponsavelPage() {
  const { user } = useAuth();
  const { alunoAtual, isLoading: carregandoAlunos } = useAlunoSelecionado();
  const { resumo, loading, error } = useResumoAluno();
  const { aulas } = useGradeHorariaAluno();

  if (carregandoAlunos || loading) return <LoadingComponent />;

  if (!alunoAtual) {
    return (
      <BrainResultNotFound message="Nenhum aluno vinculado ao seu cadastro. Fale com a secretaria da escola." />
    );
  }
  if (error || !resumo) {
    return <BrainResultNotFound message="Não foi possível carregar os dados do aluno." />;
  }

  const { relatorio, proximasTarefas, ocorrenciasDaSemana } = resumo;
  const nomeAluno = alunoAtual.nomeSocial || alunoAtual.nome;

  const dataLonga = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const descricao = [
    nomeAluno,
    [alunoAtual.serie, alunoAtual.turma].filter(Boolean).join(" "),
    alunoAtual.unidade,
    dataLonga.charAt(0).toUpperCase() + dataLonga.slice(1),
  ]
    .filter(Boolean)
    .join(" · ");

  const media = relatorio.resumo.mediaGeral;
  const frequencia = relatorio.resumo.frequenciaGeral;
  const toneMedia: BadgeTone =
    media == null ? "neutral" : media >= relatorio.notaAprovacao ? "success" : "error";
  const toneFreq: BadgeTone =
    frequencia == null ? "neutral" : frequencia >= relatorio.frequenciaMinima ? "success" : "warning";

  // Aulas de hoje, derivadas da grade semanal.
  const diaHoje = DIA_ENUM[new Date().getDay()];
  const agoraMin = new Date().getHours() * 60 + new Date().getMinutes();
  const aulasHoje = aulas
    .filter((a) => a.diaDaSemana === diaHoje)
    .sort((a, b) => horaEmMinutos(a.horarioInicio) - horaEmMinutos(b.horarioInicio));

  return (
    <PageScaffold>
      <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
        <BrainyMascot height={65} />
        <PageTitle title={`Olá, ${user?.name ?? ""}!`} description={descricao} />
      </Box>

      <S.KpiGrid>
        <KpiCard
          rotulo="Média geral"
          valor={fmtNota(media, relatorio.gradingScale.decimalPlaces)}
          icone={<GradeOutlinedIcon />}
          tone={toneMedia}
        />
        <KpiCard
          rotulo="Frequência"
          valor={fmtPercentual(frequencia)}
          icone={<EventAvailableOutlinedIcon />}
          tone={toneFreq}
        />
        <KpiCard
          rotulo="Ocorrências na semana"
          valor={ocorrenciasDaSemana.length}
          icone={<FlagOutlinedIcon />}
          tone={ocorrenciasDaSemana.length > 0 ? "warning" : "success"}
        />
        <KpiCard
          rotulo="Tarefas pendentes"
          valor={proximasTarefas.length}
          icone={<AssignmentOutlinedIcon />}
          tone="info"
        />
      </S.KpiGrid>

      <Box sx={{ mt: 3 }}>
        <LayoutColumns sizeLeft="70%" sizeRight="30%">
          <div>
            <S.SecaoHeader>
              <S.SecaoTitulo>Aulas de hoje</S.SecaoTitulo>
              <S.SecaoMeta>{format(new Date(), "EEEE, dd/MM", { locale: ptBR })}</S.SecaoMeta>
            </S.SecaoHeader>

            {aulasHoje.length === 0 ? (
              <S.ListaAulas>
                <S.LinhaAula $agora={false}>
                  <S.EmptyHint>Nenhuma aula na grade para hoje.</S.EmptyHint>
                </S.LinhaAula>
              </S.ListaAulas>
            ) : (
              <S.ListaAulas>
                {aulasHoje.map((aula) => {
                  const emAula =
                    agoraMin >= horaEmMinutos(aula.horarioInicio) &&
                    agoraMin < horaEmMinutos(aula.horarioFim);
                  return (
                    <S.LinhaAula key={aula.id} $agora={emAula}>
                      <S.Horario>
                        {aula.horarioInicio} – {aula.horarioFim}
                      </S.Horario>
                      <S.AulaCorpo>
                        <S.AulaTopo>
                          <S.TagDisciplina>{aula.disciplina}</S.TagDisciplina>
                          <S.Professor>{aula.professor}</S.Professor>
                        </S.AulaTopo>
                        {aula.sala && <S.Sala>Sala {aula.sala}</S.Sala>}
                      </S.AulaCorpo>
                    </S.LinhaAula>
                  );
                })}
              </S.ListaAulas>
            )}
          </div>

          <S.SidebarStack>
            <S.PanelCard>
              <S.PanelHeader>
                <S.PanelTitle>Próximas tarefas</S.PanelTitle>
                <S.CountBadge>{proximasTarefas.length}</S.CountBadge>
              </S.PanelHeader>
              {proximasTarefas.length === 0 ? (
                <S.EmptyHint>Nenhuma tarefa pendente.</S.EmptyHint>
              ) : (
                <S.CardList>
                  {proximasTarefas.map((tarefa) => (
                    <S.TarefaCard key={tarefa.id}>
                      <S.CardTopRow>
                        <S.TagDisciplina>{tarefa.disciplina}</S.TagDisciplina>
                        <S.CardPrazo>
                          <CalendarTodayOutlinedIcon />
                          {prazoRelativo(tarefa.prazo)}
                        </S.CardPrazo>
                      </S.CardTopRow>
                      <S.CardTitle>{tarefa.conteudo}</S.CardTitle>
                    </S.TarefaCard>
                  ))}
                </S.CardList>
              )}
            </S.PanelCard>

            <S.PanelCard>
              <S.PanelHeader>
                <S.PanelTitle>Ocorrências da semana</S.PanelTitle>
              </S.PanelHeader>
              {ocorrenciasDaSemana.length === 0 ? (
                <S.EmptyHint>Nenhuma ocorrência registrada esta semana.</S.EmptyHint>
              ) : (
                <S.CardList>
                  {ocorrenciasDaSemana.slice(0, 3).map((ocorrencia, i) => (
                    <S.OcorrenciaRow key={`${ocorrencia.data}-${i}`}>
                      <S.OcorrenciaIcon>
                        <ReportGmailerrorredOutlinedIcon />
                      </S.OcorrenciaIcon>
                      <div style={{ minWidth: 0 }}>
                        <S.OcorrenciaTitulo>{ocorrencia.tipoAnotacao}</S.OcorrenciaTitulo>
                        <S.OcorrenciaMeta>
                          {[ocorrencia.disciplina, ocorrencia.data].filter(Boolean).join(" · ")}
                        </S.OcorrenciaMeta>
                      </div>
                    </S.OcorrenciaRow>
                  ))}
                </S.CardList>
              )}
            </S.PanelCard>
          </S.SidebarStack>
        </LayoutColumns>
      </Box>
    </PageScaffold>
  );
}
