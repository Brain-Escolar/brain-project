"use client";

import { useState } from "react";
import CardClass from "@/components/cardClass/cardClass";
import DateSelector from "@/components/dateSelector";
import { useAulasAluno } from "@/hooks/useAulasAluno";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import { formatDateForAPI } from "@/utils/utilsDate";
import { Box, Button, ButtonGroup, styled } from "@mui/material";

const Header = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
`;

const AulasContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const formatarHora = (horario: string): string => horario.substring(0, 5);

export default function SectionAulasAluno() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const { aulas, loading, error, refetch, isFetching } = useAulasAluno({
    data: formatDateForAPI(selectedDate),
  });

  const handleTodayClick = () => setSelectedDate(new Date());

  if (loading) {
    return (
      <Box>
        <Header>
          <Box display="flex" alignItems="center" gap={1}>
            <Button variant="outlined" size="small" onClick={handleTodayClick}>Hoje</Button>
            <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </Box>
          <ButtonGroup size="small" variant="outlined">
            <Button variant="contained" disableElevation>Diário</Button>
            <Button>Semanal</Button>
          </ButtonGroup>
        </Header>
        <LoadingComponent />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Header>
          <Box display="flex" alignItems="center" gap={1}>
            <Button variant="outlined" size="small" onClick={handleTodayClick}>Hoje</Button>
            <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </Box>
          <ButtonGroup size="small" variant="outlined">
            <Button variant="contained" disableElevation>Diário</Button>
            <Button>Semanal</Button>
          </ButtonGroup>
        </Header>
        <p style={{ color: "red" }}>{error}</p>
        <Button onClick={refetch} disabled={isFetching} size="small">
          {isFetching ? <LoadingComponent /> : "Tentar novamente"}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Header>
        <Box display="flex" alignItems="center" gap={1}>
          <Button variant="outlined" size="small" onClick={handleTodayClick}>Hoje</Button>
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </Box>
        <ButtonGroup size="small" variant="outlined">
          <Button variant="contained" disableElevation>Diário</Button>
          <Button>Semanal</Button>
        </ButtonGroup>
      </Header>

      {!aulas || aulas.length === 0 ? (
        <BrainResultNotFound message="Nenhuma aula encontrada para esse dia" />
      ) : (
        <AulasContainer>
          {aulas.map((aula, index) => (
            <CardClass
              key={`${aula.disciplina}-${aula.turma}-${index}`}
              title={`${aula.disciplina} — ${aula.serie} ${aula.turma}`}
              image={"https://placehold.co/100.png"}
              hour={`${formatarHora(aula.horarioInicio)} - ${formatarHora(aula.horarioFim)}`}
              classroom={`Sala ${aula.sala}`}
              campus={aula.unidade}
              quantityStudents={aula.quantidadeAlunos}
            />
          ))}
        </AulasContainer>
      )}
    </Box>
  );
}
