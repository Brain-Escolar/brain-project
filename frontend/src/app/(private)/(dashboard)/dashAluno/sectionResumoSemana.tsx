"use client";

import { useAnotacoesAluno } from "@/hooks/useAnotacoesAluno";
import { useTarefasAluno } from "@/hooks/useTarefasAluno";
import { getAnotacaoBadgeVariant } from "@/utils/anotacaoBadgeUtils";
import { getDisciplinaTagTone } from "@/utils/disciplinaUtils";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import * as S from "./styles";

const formatarDataCompleta = (data: string): string => {
  const [year, month, day] = data.split("-");
  return `${day}/${month}/${year}`;
};

const formatarPrazoCurto = (data: string): string => {
  const [, month, day] = data.split("-");
  return `${day}/${month}`;
};

function StatusBadgeContent({ tipo }: { tipo: string }) {
  const variant = getAnotacaoBadgeVariant(tipo);

  return (
    <S.StatusBadge $variant={variant}>
      {variant === "success" ? (
        <ThumbUpAltOutlinedIcon />
      ) : variant === "warning" ? (
        <ReportProblemOutlinedIcon />
      ) : null}
      {tipo}
    </S.StatusBadge>
  );
}

export default function SectionResumoSemana() {
  const { anotacoes, loading: loadingAnotacoes } = useAnotacoesAluno();
  const { tarefas, loading: loadingTarefas } = useTarefasAluno();

  return (
    <S.ResumoContainer>
      <S.ResumoHeader>
        <S.ResumoTitle>Resumo da semana</S.ResumoTitle>
      </S.ResumoHeader>

      <S.Section>
        <S.SectionHeader>
          <S.SectionTitle>Desempenho</S.SectionTitle>
        </S.SectionHeader>
        <S.DesempenhoGrid>
          <S.MediaRow>
            <S.MediaLabel>Média geral</S.MediaLabel>
            <S.MediaValue>—</S.MediaValue>
          </S.MediaRow>
          <S.ProgressBlock>
            <S.ProgressHeader>
              <S.ProgressLabel>Frequência</S.ProgressLabel>
              <S.ProgressValue>—</S.ProgressValue>
            </S.ProgressHeader>
            <S.ProgressTrack>
              <S.ProgressFill $value={0} $tone="success" />
            </S.ProgressTrack>
          </S.ProgressBlock>
          <S.ProgressBlock>
            <S.ProgressHeader>
              <S.ProgressLabel>Conteúdo do bimestre</S.ProgressLabel>
              <S.ProgressValue>—</S.ProgressValue>
            </S.ProgressHeader>
            <S.ProgressTrack>
              <S.ProgressFill $value={0} $tone="primary" />
            </S.ProgressTrack>
          </S.ProgressBlock>
        </S.DesempenhoGrid>
      </S.Section>

      <S.Section>
        <S.SectionHeader>
          <S.SectionTitle>Registros disciplinares</S.SectionTitle>
          <S.CountBadge>{anotacoes.length}</S.CountBadge>
        </S.SectionHeader>

        {loadingAnotacoes ? (
          <S.EmptyHint>Carregando...</S.EmptyHint>
        ) : anotacoes.length === 0 ? (
          <S.EmptyHint>Nenhum registro esta semana</S.EmptyHint>
        ) : (
          anotacoes.map((anotacao, index) => (
            <S.Card key={index}>
              <S.CardTopRow>
                <S.CardTitle>{anotacao.disciplina}</S.CardTitle>
                <StatusBadgeContent tipo={anotacao.tipoAnotacao} />
              </S.CardTopRow>
              <S.CardMeta>{formatarDataCompleta(anotacao.data)}</S.CardMeta>
              {anotacao.observacao && (
                <S.CardDescription>{anotacao.observacao}</S.CardDescription>
              )}
            </S.Card>
          ))
        )}
      </S.Section>

      <S.Section>
        <S.SectionHeader>
          <S.SectionTitle>Próximas tarefas</S.SectionTitle>
          <S.CountBadge>{tarefas.length}</S.CountBadge>
        </S.SectionHeader>

        {loadingTarefas ? (
          <S.EmptyHint>Carregando...</S.EmptyHint>
        ) : tarefas.length === 0 ? (
          <S.EmptyHint>Nenhuma tarefa pendente</S.EmptyHint>
        ) : (
          tarefas.map((tarefa) => {
            const tagLabel = `${tarefa.serie} ${tarefa.turma}`.trim();
            return (
              <S.Card key={tarefa.id}>
                <S.CardTopRow>
                  <S.SubjectTag $tone={getDisciplinaTagTone(tagLabel)}>{tagLabel}</S.SubjectTag>
                  <S.CardDeadline>
                    <CalendarTodayOutlinedIcon />
                    {formatarPrazoCurto(tarefa.prazo)}
                  </S.CardDeadline>
                </S.CardTopRow>
                <S.CardDescription>{tarefa.conteudo}</S.CardDescription>
              </S.Card>
            );
          })
        )}
      </S.Section>
    </S.ResumoContainer>
  );
}
