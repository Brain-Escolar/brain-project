"use client";

import { useQuery } from "@tanstack/react-query";
import { professorApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { TipoEvento } from "@/services/domains/professor/response";
import * as S from "./styles";

const formatarData = (dataISO: string): string => {
  const [, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}`;
};

/** Rótulo curto do tipo de evento, exibido como tag à direita da linha. */
const TIPO_LABEL: Record<TipoEvento, string> = {
  PROVA: "Prova",
  ENTREGA_PROVA: "Entrega de prova",
  ENTREGA_NOTAS: "Lançar notas",
  REUNIAO: "Reunião",
  FERIADO: "Feriado",
  OUTRO: "",
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
        <S.Title>Planejamento</S.Title>
        <S.Subtitle>
          Visualize rapidamente as tarefas para hoje e as próximas avaliações
        </S.Subtitle>
      </S.Header>

      <S.EventList>
        {isLoading ? (
          <S.EmptyState>Carregando...</S.EmptyState>
        ) : eventos.length === 0 ? (
          <S.EmptyState>Nenhum evento encontrado</S.EmptyState>
        ) : (
          eventos.map((evento) => {
            const tag = TIPO_LABEL[evento.tipo];
            return (
              <S.EventItem key={evento.id}>
                <S.EventDate>{formatarData(evento.dataEvento)}</S.EventDate>
                <S.EventTitle>{evento.titulo}</S.EventTitle>
                {tag && <S.EventTag>{tag}</S.EventTag>}
              </S.EventItem>
            );
          })
        )}
      </S.EventList>

      {eventos.length > 0 && <S.ViewMoreButton>VER MAIS</S.ViewMoreButton>}
    </S.Container>
  );
}
