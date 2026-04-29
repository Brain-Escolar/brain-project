"use client";

import { useAnotacoesAluno } from "@/hooks/useAnotacoesAluno";
import { useTarefasAluno } from "@/hooks/useTarefasAluno";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import * as S from "./styles";

const formatarData = (data: string): string => {
  const [year, month, day] = data.split("-");
  return `${day}/${month}/${year.substring(2)}`;
};

export default function SectionResumoSemana() {
  const { anotacoes, loading: loadingAnotacoes } = useAnotacoesAluno();
  const { tarefas, loading: loadingTarefas } = useTarefasAluno();

  return (
    <S.ResumoContainer>
      <S.ResumoHeader>
        <S.ResumoTitle>Resumo da semana</S.ResumoTitle>
        <S.ResumoSubtitle>Visualize os principais acontecimentos da semana</S.ResumoSubtitle>
      </S.ResumoHeader>

      <S.Section>
        <S.SectionHeader>
          <S.SectionTitle>Registros disciplinares</S.SectionTitle>
          <S.CountBadge>{anotacoes.length}</S.CountBadge>
        </S.SectionHeader>

        {loadingAnotacoes ? (
          <S.CardMeta>Carregando...</S.CardMeta>
        ) : anotacoes.length === 0 ? (
          <S.CardMeta>Nenhum registro esta semana</S.CardMeta>
        ) : (
          anotacoes.map((anotacao, index) => (
            <S.Card key={index}>
              <S.CardTopRow>
                <S.CardTitle>{anotacao.disciplina}</S.CardTitle>
                <S.CardBadge>{anotacao.tipoAnotacao}</S.CardBadge>
              </S.CardTopRow>
              <S.CardMeta>{formatarData(anotacao.data)}</S.CardMeta>
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
          <S.CardMeta>Carregando...</S.CardMeta>
        ) : tarefas.length === 0 ? (
          <S.CardMeta>Nenhuma tarefa pendente</S.CardMeta>
        ) : (
          tarefas.map((tarefa, index) => (
            <S.Card key={index}>
              <S.CardTopRow>
                <S.CardTitle>{tarefa.titulo}</S.CardTitle>
                <S.CardBadge>{tarefa.turma}</S.CardBadge>
              </S.CardTopRow>
              <S.CardMeta>
                {tarefa.serie} - {tarefa.unidade}
              </S.CardMeta>
              {tarefa.conteudo && (
                <S.CardDescription>{tarefa.conteudo}</S.CardDescription>
              )}
              <S.CardDeadline>
                <AccessTimeIcon sx={{ fontSize: 12 }} />
                Envio: {formatarData(tarefa.prazo)}
              </S.CardDeadline>
            </S.Card>
          ))
        )}
      </S.Section>
    </S.ResumoContainer>
  );
}
