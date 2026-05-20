"use client";

import { useQuery } from "@tanstack/react-query";
import { professorApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import * as S from "./styles";

const formatarData = (dataISO: string): string => {
  try {
    return new Date(dataISO).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dataISO;
  }
};

export default function SectionPlanejamento() {
  const { data: planejamentos = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.planejamento.list(),
    queryFn: () => professorApi.getPlanejamento(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return (
    <S.Container>
      <S.Header>
        <S.HeaderContent>
          <S.Title>Planejamento</S.Title>
          <S.Subtitle>
            Visualize rapidamente as tarefas para hoje e as próximas atividades
          </S.Subtitle>
        </S.HeaderContent>
      </S.Header>

      <S.TasksSection>
        <S.SectionTitle>
          &nbsp;
          <S.TaskCount>{planejamentos.length}</S.TaskCount>
        </S.SectionTitle>

        {isLoading ? (
          <div>Carregando...</div>
        ) : planejamentos.length > 0 ? (
          planejamentos.map((planejamento, index) => (
            <S.TaskItem key={index}>
              <S.TaskTitle>{planejamento.titulo}</S.TaskTitle>
              <S.TaskMeta>
                <span>Início: {formatarData(planejamento.dataInicio)}</span>
                <span>Fim: {formatarData(planejamento.dataFim)}</span>
              </S.TaskMeta>
              <S.TaskDescription>{planejamento.descricao}</S.TaskDescription>
            </S.TaskItem>
          ))
        ) : (
          <div>Nenhum planejamento encontrado</div>
        )}

        {planejamentos.length > 0 && <S.ViewMoreButton>VER MAIS</S.ViewMoreButton>}
      </S.TasksSection>
    </S.Container>
  );
}
