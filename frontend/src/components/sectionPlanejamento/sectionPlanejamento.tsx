"use client";

import { useEffect, useState } from "react";
import { professorApi } from "@/services/api";
import { ProfessorPlanejamentoResponse } from "@/services/domains/professor/response";
import * as S from "./styles";

export default function SectionPlanejamento() {
  const [planejamentos, setPlanejamentos] = useState<ProfessorPlanejamentoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para formatar data ISO para formato brasileiro
  const formatarData = (dataISO: string): string => {
    try {
      const data = new Date(dataISO);
      return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return dataISO; // Retorna a data original em caso de erro
    }
  };

  useEffect(() => {
    const loadPlanejamentos = async () => {
      try {
        setIsLoading(true);
        const response = await professorApi.getPlanejamento();
        setPlanejamentos(response);
      } catch (error) {
        console.error("Erro ao carregar planejamentos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlanejamentos();
  }, []);

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
