"use client";

import { useState } from "react";
import CardClass from "@/components/cardClass/cardClass";
import DateSelector from "@/components/dateSelector";
import { useAulas } from "@/hooks/useAulas";
import { useRouter } from "next/navigation";
import * as S from "./styles";
import BrainResultNotFound from "../resultNotFound/resultNotFound";
import LoadingComponent from "../loadingComponent/loadingComponent";
import { formatDateForAPI } from "@/utils/utilsDate";
import { RoutesEnum } from "@/enums";

export default function SectionMinhasAulas() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const router = useRouter();

  const { aulas, loading, error, refetch, isFetching } = useAulas({
    data: formatDateForAPI(selectedDate),
  });

  const handleAulaClick = (id: number) => {
    // const route = `${RoutesEnum.AULA_CADASTRO}?id=${id}`;
    const route = `${RoutesEnum.AULAS_DETALHE}/${id}`;
    router.push(route);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const formataHora = (horarioInicio: number[], horarioFim: number[]): string => {
    const pad = (num: number) => num.toString().padStart(2, "0");
    return `${pad(horarioInicio[0])}:${pad(horarioInicio[1])} - ${pad(horarioFim[0])}:${pad(horarioFim[1])}`;
  };

  if (loading) {
    return (
      <S.Container>
        <DateSelector selectedDate={selectedDate} onDateChange={handleDateChange} />
        <LoadingComponent />
      </S.Container>
    );
  }

  if (error) {
    return (
      <S.Container>
        <DateSelector selectedDate={selectedDate} onDateChange={handleDateChange} />
        <p style={{ color: "red" }}>{error}</p>
        <button
          onClick={refetch}
          style={{
            marginTop: "8px",
            padding: "4px 8px",
            cursor: "pointer",
            opacity: isFetching ? 0.6 : 1,
          }}
          disabled={isFetching}
        >
          {isFetching ? <LoadingComponent /> : "Tentar novamente"}
        </button>
      </S.Container>
    );
  }

  if (!aulas || aulas.length === 0) {
    return (
      <S.Container>
        <DateSelector selectedDate={selectedDate} onDateChange={handleDateChange} />
        <BrainResultNotFound message="Não foram encontrado aulas para esse periodo" />
      </S.Container>
    );
  }

  return (
    <S.Container>
      <DateSelector selectedDate={selectedDate} onDateChange={handleDateChange} />
      {aulas.map((aula, index) => (
        <CardClass
          key={`${aula.disciplina}-${aula.turma}-${index}`} // Chave mais específica
          title={`${aula.disciplina} - ${aula.serie} ${aula.turma} `}
          image={"https://placehold.co/100.png"}
          hour={formataHora(aula.horarioInicio, aula.horarioFim)}
          classroom={`${aula.sala} ${aula.turma}`}
          campus={aula.unidade}
          quantityStudents={aula.quantidadeAlunos}
          onClick={() => handleAulaClick(aula.id)}
        />
      ))}
    </S.Container>
  );
}
