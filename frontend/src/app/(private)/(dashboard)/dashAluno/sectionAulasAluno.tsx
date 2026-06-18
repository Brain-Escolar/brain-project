"use client";

import { useState } from "react";
import CardClass, { CardClassPanel } from "@/components/cardClass/cardClass";
import SegmentedControl from "@/components/segmentedControl/segmentedControl";
import DateSelector from "@/components/dateSelector";
import { useAulasAluno } from "@/hooks/useAulasAluno";
import { useAulasAlunoSemana } from "@/hooks/useAulasAlunoSemana";
import { getWeekDays } from "@/hooks/useAulasSemana";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import LoadingComponent from "@/components/loadingComponent/loadingComponent";
import { formatDateForAPI } from "@/utils/utilsDate";
import { RoutesEnum } from "@/enums";
import { Box, Button, IconButton, styled, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import TabelaHorarioSemanal from "@/components/tabelaHorarioSemanal/tabelaHorarioSemanal";
import { EstudanteAulaResponse } from "@/services/domains/estudante";

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

const formatarHora = (horario: string): string => horario.substring(0, 5);

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
    <SegmentedControl
      value={viewMode}
      onChange={onViewChange}
      ariaLabel="Modo de visualização"
      options={[
        { value: "diario", label: "Diário" },
        { value: "semanal", label: "Semanal" },
      ]}
    />
  );
}

function SemanalContent({
  selectedDate,
  onAulaClick,
}: {
  selectedDate: Date;
  onAulaClick: (aula: EstudanteAulaResponse) => void;
}) {
  const { aulasByDay, loading, error } = useAulasAlunoSemana();
  const days = getWeekDays(selectedDate);

  if (loading) return <LoadingComponent />;
  if (error) return <p style={{ color: "red" }}>Erro ao carregar as aulas da semana.</p>;

  return (
    <CardClassPanel style={{ padding: 16 }}>
      <TabelaHorarioSemanal
        aulasByDay={aulasByDay}
        weekDays={days}
        onAulaClick={onAulaClick}
        renderCard={(aula) => (
          <>
            <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.25 }}>
              {aula.disciplina}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "var(--colors-textSecondary)", mt: 0.3 }}>
              {aula.professor}
            </Typography>
          </>
        )}
      />
    </CardClassPanel>
  );
}

export default function SectionAulasAluno() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("diario");

  const { aulas, loading, error, refetch, isFetching } = useAulasAluno({
    data: formatDateForAPI(selectedDate),
  });

  const handleAulaClick = (aula: EstudanteAulaResponse) =>
    router.push(`${RoutesEnum.ALUNO_AULA}/${aula.id}`);

  return (
    <Box sx={{ width: "100%" }}>
      <Header>
        {viewMode === "semanal" ? (
          <WeekNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
        ) : (
          <Box display="flex" alignItems="center" gap={1}>
            <Button variant="outlined" size="small" onClick={() => setSelectedDate(new Date())}>
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
        <BrainResultNotFound message="Nenhuma aula encontrada para esse dia" />
      ) : (
        <CardClassPanel>
          {aulas.map((aula) => (
            <CardClass
              key={aula.id}
              title={`${aula.disciplina} — ${aula.serie} ${aula.turma}`}
              image={"https://placehold.co/100.png"}
              hour={`${formatarHora(aula.horarioInicio)} - ${formatarHora(aula.horarioFim)}`}
              classroom={`Sala ${aula.sala}`}
              campus={aula.unidade}
              onClick={() => handleAulaClick(aula)}
            />
          ))}
        </CardClassPanel>
      )}
    </Box>
  );
}
