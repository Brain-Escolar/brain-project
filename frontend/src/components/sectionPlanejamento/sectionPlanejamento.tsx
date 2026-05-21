"use client";

import { useQuery } from "@tanstack/react-query";
import { professorApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { TipoEvento } from "@/services/domains/professor/response";
import * as S from "./styles";

const COR_TIPO: Record<TipoEvento, string> = {
  PROVA: "#9c27b0",
  ENTREGA_PROVA: "#e91e63",
  ENTREGA_NOTAS: "#ff9800",
  REUNIAO: "#2196f3",
  FERIADO: "#f44336",
  OUTRO: "#607d8b",
};

const formatarData = (dataISO: string): string => {
  const [, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}`;
};

export default function SectionPlanejamento() {
  const { data: eventos = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.planejamento.list(),
    queryFn: async () => {
      const response = await professorApi.getPlanejamento();
      return response.content;
    },
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
            Visualize rapidamente as tarefas para hoje e as próximas avaliações
          </S.Subtitle>
        </S.HeaderContent>
      </S.Header>

      <S.TasksSection>
        <S.SectionTitle>
          Eventos próximos
          <S.TaskCount>{eventos.length}</S.TaskCount>
        </S.SectionTitle>

        {isLoading ? (
          <div>Carregando...</div>
        ) : eventos.length === 0 ? (
          <div style={{ color: "#999", fontSize: "0.875rem" }}>
            Nenhum evento encontrado
          </div>
        ) : (
          eventos.map((evento) => (
            <S.EvaluationItem key={evento.id}>
              <S.EvaluationDate>{formatarData(evento.dataEvento)}</S.EvaluationDate>
              <S.EvaluationIcon style={{ background: COR_TIPO[evento.tipo] ?? "#607d8b" }} />
              <S.EvaluationContent>
                <S.EvaluationTitle>{evento.titulo}</S.EvaluationTitle>
              </S.EvaluationContent>
            </S.EvaluationItem>
          ))
        )}

        {eventos.length > 0 && <S.ViewMoreButton>VER MAIS</S.ViewMoreButton>}
      </S.TasksSection>
    </S.Container>
  );
}
