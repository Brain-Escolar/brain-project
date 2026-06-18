"use client";

import { useState } from "react";
import CardClass, { CardClassPanel } from "@/components/cardClass/cardClass";
import SegmentedControl from "@/components/segmentedControl/segmentedControl";
import DateSelector from "@/components/dateSelector";
import { useAulas } from "@/hooks/useAulas";
import { useAulasSemana, getWeekDays } from "@/hooks/useAulasSemana";
import { useRouter, useSearchParams } from "next/navigation";
import BrainResultNotFound from "../resultNotFound/resultNotFound";
import LoadingComponent from "../loadingComponent/loadingComponent";
import { formatDateForAPI } from "@/utils/utilsDate";
import { RoutesEnum } from "@/enums";
import { Box, Button, IconButton, styled, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import TabelaHorarioSemanal from "../tabelaHorarioSemanal/tabelaHorarioSemanal";

type ViewMode = "diario" | "semanal";

/** Formata um horário vindo da API como [hora, minuto] para "HH:MM". */
function formatHorario(time: number[]): string {
  const [h = 0, m = 0] = time ?? [];
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

const toMinutes = (time: number[]): number => (time?.[0] ?? 0) * 60 + (time?.[1] ?? 0);

const Header = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
`;

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
  onAulaClick: (id: number) => void;
}) {
  const { aulasByDay, weekDays, loading, error } = useAulasSemana(selectedDate);

  if (loading) return <LoadingComponent />;
  if (error) return <p style={{ color: "red" }}>Erro ao carregar as aulas da semana.</p>;

  return (
    <CardClassPanel style={{ padding: 16 }}>
      <TabelaHorarioSemanal
        aulasByDay={aulasByDay}
        weekDays={weekDays}
        onAulaClick={(aula) => onAulaClick(aula.id)}
        renderCard={(aula) => (
          <>
            <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.25 }}>
              {aula.disciplina}
            </Typography>
            <Typography
              sx={{ fontSize: 12, color: "var(--colors-textSecondary)", mt: 0.3 }}
            >
              {aula.serie} {aula.turma}
            </Typography>
            <Typography
              sx={{ fontSize: 11, color: "var(--colors-textTertiary)", mt: 0.2 }}
            >
              Sala {aula.sala}
            </Typography>
          </>
        )}
      />
    </CardClassPanel>
  );
}

function parseDateParam(param: string | null): Date {
  if (param) {
    const parsed = parseISO(param);
    if (isValid(parsed)) return parsed;
  }
  return new Date();
}

function parseViewParam(param: string | null): ViewMode {
  if (param === "semanal" || param === "diario") return param;
  return "diario";
}

export default function SectionMinhasAulas() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    parseDateParam(searchParams.get("data"))
  );
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    parseViewParam(searchParams.get("view"))
  );

  function syncURL(date: Date, mode: ViewMode) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("data", formatDateForAPI(date));
    params.set("view", mode);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  function handleDateChange(date: Date) {
    setSelectedDate(date);
    syncURL(date, viewMode);
  }

  function handleViewModeChange(mode: ViewMode) {
    setViewMode(mode);
    syncURL(selectedDate, mode);
  }

  const { aulas, loading, error, refetch, isFetching } = useAulas({
    data: formatDateForAPI(selectedDate),
  });

  const handleAulaClick = (id: number) => {
    router.push(`${RoutesEnum.AULAS_DETALHE}/${id}?data=${formatDateForAPI(selectedDate)}`);
  };

  // "Próxima aula": no dia de hoje, a primeira aula que ainda não terminou
  // (se todas já passaram, destaca a primeira). Em outros dias, sem destaque.
  let proximaAulaIndex = -1;
  if (isToday(selectedDate) && aulas.length > 0) {
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    proximaAulaIndex = aulas.findIndex((a) => toMinutes(a.horarioFim) > nowMin);
    if (proximaAulaIndex === -1) proximaAulaIndex = 0;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Header>
        {viewMode === "semanal" ? (
          <WeekNavigator selectedDate={selectedDate} onDateChange={handleDateChange} />
        ) : (
          <Box display="flex" alignItems="center" gap={1}>
            <Button variant="outlined" size="small" onClick={() => handleDateChange(new Date())}>
              Hoje
            </Button>
            <DateSelector selectedDate={selectedDate} onDateChange={handleDateChange} />
          </Box>
        )}
        <ViewToggle viewMode={viewMode} onViewChange={handleViewModeChange} />
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
        <CardClassPanel>
          {aulas.map((aula, index) => (
            <CardClass
              key={`${aula.disciplina}-${aula.turma}-${index}`}
              title={`${aula.disciplina} - ${aula.serie} ${aula.turma}`}
              image={"https://placehold.co/100.png"}
              hour={`${formatHorario(aula.horarioInicio)} - ${formatHorario(aula.horarioFim)}`}
              classroom={`Sala ${aula.sala}`}
              students={aula.quantidadeAlunos}
              highlight={index === proximaAulaIndex}
              badgeLabel={index === proximaAulaIndex ? "Próxima aula" : undefined}
              onClick={() => handleAulaClick(aula.id)}
            />
          ))}
        </CardClassPanel>
      )}
    </Box>
  );
}
