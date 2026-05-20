"use client";

import { useState } from "react";
import CardClass from "@/components/cardClass/cardClass";
import DateSelector from "@/components/dateSelector";
import { useAulas } from "@/hooks/useAulas";
import { useAulasSemana, getWeekDays } from "@/hooks/useAulasSemana";
import { useRouter } from "next/navigation";
import BrainResultNotFound from "../resultNotFound/resultNotFound";
import LoadingComponent from "../loadingComponent/loadingComponent";
import { formatDateForAPI } from "@/utils/utilsDate";
import { RoutesEnum } from "@/enums";
import { Box, Button, ButtonGroup, IconButton, styled, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import TabelaHorarioSemanal from "../tabelaHorarioSemanal/tabelaHorarioSemanal";

type ViewMode = "diario" | "semanal";

const Header = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
`;

const AulasContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const formataHora = (horarioInicio: number[], horarioFim: number[]): string => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(horarioInicio[0])}:${pad(horarioInicio[1])} - ${pad(horarioFim[0])}:${pad(horarioFim[1])}`;
};

function WeekRangeLabel({ date }: { date: Date }) {
  const days = getWeekDays(date);
  const start = format(days[0], "d", { locale: ptBR });
  const end = format(days[4], "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  return <span>{`${start} - ${end}`}</span>;
}

function WeekNavigator({
  selectedDate,
  onDateChange,
}: {
  selectedDate: Date;
  onDateChange: (d: Date) => void;
}) {
  const handlePrev = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    onDateChange(d);
  };
  const handleNext = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    onDateChange(d);
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Button variant="outlined" size="small" onClick={() => onDateChange(new Date())}>
        Hoje
      </Button>
      <IconButton onClick={handlePrev} size="small">
        <ChevronLeft />
      </IconButton>
      <IconButton onClick={handleNext} size="small">
        <ChevronRight />
      </IconButton>
      <WeekRangeLabel date={selectedDate} />
    </Box>
  );
}

function ViewToggle({
  viewMode,
  onViewChange,
}: {
  viewMode: ViewMode;
  onViewChange: (v: ViewMode) => void;
}) {
  return (
    <ButtonGroup size="small" variant="outlined">
      <Button
        variant={viewMode === "diario" ? "contained" : "outlined"}
        disableElevation
        onClick={() => onViewChange("diario")}
      >
        Diário
      </Button>
      <Button
        variant={viewMode === "semanal" ? "contained" : "outlined"}
        disableElevation
        onClick={() => onViewChange("semanal")}
      >
        Semanal
      </Button>
    </ButtonGroup>
  );
}

function SemanalContent({
  selectedDate,
  onAulaClick,
}: {
  selectedDate: Date;
  onAulaClick: (id: number) => void;
}) {
  const { aulasByDay, weekDays, loading, error } = useAulasSemana(selectedDate);

  if (loading) return <LoadingComponent />;
  if (error) return <p style={{ color: "red" }}>Erro ao carregar as aulas da semana.</p>;

  return (
    <TabelaHorarioSemanal
      aulasByDay={aulasByDay}
      weekDays={weekDays}
      onAulaClick={(aula) => onAulaClick(aula.id)}
      renderCard={(aula) => (
        <>
          <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
            {aula.disciplina}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#555", mt: 0.3 }}>
            {aula.serie} {aula.turma}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#777", mt: 0.2 }}>
            Sala {aula.sala}
          </Typography>
        </>
      )}
    />
  );
}

export default function SectionMinhasAulas() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("diario");
  const router = useRouter();

  const { aulas, loading, error, refetch, isFetching } = useAulas({
    data: formatDateForAPI(selectedDate),
  });

  const handleAulaClick = (id: number) => {
    router.push(`${RoutesEnum.AULAS_DETALHE}/${id}`);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Header>
        {viewMode === "semanal" ? (
          <WeekNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
        ) : (
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSelectedDate(new Date())}
            >
              Hoje
            </Button>
            <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </Box>
        )}
        <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
      </Header>

      {viewMode === "semanal" ? (
        <SemanalContent selectedDate={selectedDate} onAulaClick={handleAulaClick} />
      ) : loading ? (
        <LoadingComponent />
      ) : error ? (
        <>
          <p style={{ color: "red" }}>{error}</p>
          <Button onClick={refetch} disabled={isFetching} size="small">
            {isFetching ? <LoadingComponent /> : "Tentar novamente"}
          </Button>
        </>
      ) : !aulas || aulas.length === 0 ? (
        <BrainResultNotFound message="Não foram encontradas aulas para esse dia" />
      ) : (
        <AulasContainer>
          {aulas.map((aula, index) => (
            <CardClass
              key={`${aula.disciplina}-${aula.turma}-${index}`}
              title={`${aula.disciplina} - ${aula.serie} ${aula.turma}`}
              image={"https://placehold.co/100.png"}
              hour={formataHora(aula.horarioInicio, aula.horarioFim)}
              classroom={`${aula.sala} ${aula.turma}`}
              campus={aula.unidade}
              quantityStudents={aula.quantidadeAlunos}
              onClick={() => handleAulaClick(aula.id)}
            />
          ))}
        </AulasContainer>
      )}
    </Box>
  );
}
