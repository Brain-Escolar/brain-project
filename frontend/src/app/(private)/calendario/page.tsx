"use client";
import LayoutColumns from "@/components/layoutColumns/layoutColumns";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Checkbox,
  FormControlLabel,
  Stack,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { useState, useMemo } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import { useEventos } from "@/hooks/useEventos";
import { TipoEvento } from "@/services/domains/evento";
import NovoEventoModal from "./NovoEventoModal";

const TIPO_CONFIG: Record<TipoEvento, { label: string; color: string }> = {
  PROVA: { label: "Provas", color: "#f44336" },
  ENTREGA_PROVA: { label: "Entregas de Prova", color: "#ff9800" },
  ENTREGA_NOTAS: { label: "Entrega de Notas", color: "#9c27b0" },
  REUNIAO: { label: "Reuniões", color: "#2196f3" },
  FERIADO: { label: "Feriados", color: "#4caf50" },
  OUTRO: { label: "Outros", color: "#757575" },
};

const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const daysOfWeek = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

interface CalendarDay {
  year: number;
  month: number;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

function buildCalendarDays(year: number, month: number): CalendarDay[] {
  const today = new Date();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: CalendarDay[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    days.push({ year: y, month: m, day: d, isCurrentMonth: false, isToday: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      year, month, day: d, isCurrentMonth: true,
      isToday: today.getFullYear() === year && today.getMonth() === month && today.getDate() === d,
    });
  }

  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
      days.push({ year: nextYear, month: nextMonth, day: d, isCurrentMonth: false, isToday: false });
    }
  }

  return days;
}

export default function Calendario() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [tiposAtivos, setTiposAtivos] = useState<Set<TipoEvento>>(
    new Set(Object.keys(TIPO_CONFIG) as TipoEvento[]),
  );
  const [modalAberto, setModalAberto] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState<string | undefined>(undefined);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const dataInicio = formatDate(currentYear, currentMonth, 1);
  const dataFim = formatDate(currentYear, currentMonth, new Date(currentYear, currentMonth + 1, 0).getDate());

  const { eventos, loading } = useEventos({ dataInicio, dataFim });

  const calendarDays = useMemo(() => buildCalendarDays(currentYear, currentMonth), [currentYear, currentMonth]);

  const eventosPorDia = useMemo(() => {
    const map: Record<string, typeof eventos> = {};
    for (const evento of eventos) {
      if (!map[evento.dataEvento]) map[evento.dataEvento] = [];
      map[evento.dataEvento].push(evento);
    }
    return map;
  }, [eventos]);

  const eventosFiltrados = useMemo(
    () => eventos.filter((e) => tiposAtivos.has(e.tipo)),
    [eventos, tiposAtivos],
  );

  const contagemPorTipo = useMemo(() => {
    const counts: Partial<Record<TipoEvento, number>> = {};
    for (const evento of eventosFiltrados) {
      counts[evento.tipo] = (counts[evento.tipo] ?? 0) + 1;
    }
    return counts;
  }, [eventosFiltrados]);

  function navigatePrev() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function navigateNext() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  function goToToday() {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  }

  function toggleTipo(tipo: TipoEvento) {
    setTiposAtivos((prev) => {
      const next = new Set(prev);
      if (next.has(tipo)) next.delete(tipo);
      else next.add(tipo);
      return next;
    });
  }

  function getEventosDoDia(day: CalendarDay) {
    const key = formatDate(day.year, day.month, day.day);
    return (eventosPorDia[key] ?? []).filter((e) => tiposAtivos.has(e.tipo));
  }

  function abrirNovoEvento(data?: string) {
    setDataSelecionada(data);
    setModalAberto(true);
  }

  const tituloMes = `${MESES_PT[currentMonth]} ${currentYear}`;

  const filtrosSidebar = (
    <Stack spacing={isMobile ? 1 : 2}>
      {(Object.keys(TIPO_CONFIG) as TipoEvento[]).map((tipo) => {
        const cfg = TIPO_CONFIG[tipo];
        const count = contagemPorTipo[tipo] ?? 0;
        return (
          <FormControlLabel
            key={tipo}
            control={
              <Checkbox
                checked={tiposAtivos.has(tipo)}
                onChange={() => toggleTipo(tipo)}
                size="small"
              />
            }
            label={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: isMobile ? 8 : 12, height: isMobile ? 8 : 12, bgcolor: cfg.color, borderRadius: 1 }} />
                  <Typography variant={isMobile ? "caption" : "body2"} sx={isMobile ? { fontSize: "0.7rem" } : {}}>
                    {cfg.label}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  ({count})
                </Typography>
              </Box>
            }
            sx={{ m: 0, width: "100%" }}
          />
        );
      })}
    </Stack>
  );

  const calendarHeader = (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: isMobile ? 1 : 3,
        flexWrap: "wrap",
        gap: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Button
          variant="text"
          size="small"
          onClick={goToToday}
          sx={{ textTransform: "uppercase", fontSize: isMobile ? "0.7rem" : undefined }}
        >
          Hoje
        </Button>
        <IconButton size="small" onClick={navigatePrev}>
          <ArrowBackIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
        <IconButton size="small" onClick={navigateNext}>
          <ArrowForwardIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
        <Typography variant={isMobile ? "body1" : "h6"} sx={{ ml: 1 }}>
          {tituloMes}
        </Typography>
        {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
      </Box>
    </Box>
  );

  const calendarGrid = (
    <Card>
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          {daysOfWeek.map((day, index) => (
            <Box
              key={index}
              sx={{
                p: isMobile ? 0.5 : 2,
                textAlign: "center",
                borderRight: index < 6 ? 1 : 0,
                borderColor: "divider",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="bold"
                sx={isMobile ? { fontSize: "0.6rem" } : {}}
              >
                {day}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {calendarDays.map((dayInfo, index) => {
            const dayEvents = getEventosDoDia(dayInfo);
            return (
              <Box
                key={index}
                onClick={() => abrirNovoEvento(formatDate(dayInfo.year, dayInfo.month, dayInfo.day))}
                sx={{
                  minHeight: isMobile ? 60 : 120,
                  p: isMobile ? 0.5 : 1,
                  borderRight: (index + 1) % 7 !== 0 ? 1 : 0,
                  borderBottom: index < calendarDays.length - 7 ? 1 : 0,
                  borderColor: "divider",
                  bgcolor: !dayInfo.isCurrentMonth ? "grey.50" : "transparent",
                  position: "relative",
                  cursor: "pointer",
                  transition: "background-color 0.15s",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Typography
                  variant={isMobile ? "caption" : "body2"}
                  sx={{
                    color: dayInfo.isToday ? "white" : !dayInfo.isCurrentMonth ? "text.disabled" : "text.primary",
                    fontWeight: dayInfo.isToday ? "bold" : "normal",
                    bgcolor: dayInfo.isToday ? "primary.main" : "transparent",
                    width: dayInfo.isToday ? (isMobile ? 16 : 24) : "auto",
                    height: dayInfo.isToday ? (isMobile ? 16 : 24) : "auto",
                    borderRadius: dayInfo.isToday ? "50%" : 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isMobile ? "0.7rem" : undefined,
                  }}
                >
                  {dayInfo.day}
                </Typography>

                {isMobile ? (
                  dayEvents.length > 0 && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 2,
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        gap: 0.2,
                      }}
                    >
                      {dayEvents.slice(0, 2).map((evento) => (
                        <Box
                          key={evento.id}
                          sx={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            bgcolor: TIPO_CONFIG[evento.tipo].color,
                          }}
                        />
                      ))}
                      {dayEvents.length > 2 && (
                        <Typography sx={{ fontSize: "6px", color: "text.secondary" }}>
                          +{dayEvents.length - 2}
                        </Typography>
                      )}
                    </Box>
                  )
                ) : (
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    {dayEvents.slice(0, 3).map((evento) => (
                      <Box
                        key={evento.id}
                        sx={{
                          fontSize: "10px",
                          p: 0.5,
                          borderRadius: 1,
                          bgcolor: TIPO_CONFIG[evento.tipo].color,
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          overflow: "hidden",
                        }}
                      >
                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "white", flexShrink: 0 }} />
                        <Typography
                          variant="caption"
                          sx={{ fontSize: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        >
                          {evento.titulo}
                        </Typography>
                      </Box>
                    ))}
                    {dayEvents.length > 3 && (
                      <Typography variant="caption" sx={{ fontSize: "10px", color: "text.secondary", pl: 0.5 }}>
                        +{dayEvents.length - 3} mais
                      </Typography>
                    )}
                  </Stack>
                )}
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <PageScaffold
      title="Calendário"
      description="Gerencie seu calendário e seus compromissos"
      actions={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => abrirNovoEvento()}
          size={isMobile ? "small" : "medium"}
        >
          Novo evento
        </Button>
      }
    >
      {isMobile ? (
        <Stack spacing={3}>
          {calendarHeader}
          {calendarGrid}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontSize: "1.1rem" }}>
              Filtros de Eventos
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1 }}>
              {filtrosSidebar}
            </Box>
          </Box>
        </Stack>
      ) : (
        <LayoutColumns sizeLeft="70%" sizeRight="30%">
          <Box>
            {calendarHeader}
            {calendarGrid}
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>
              Eventos
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Filtre os eventos do calendário
            </Typography>
            {filtrosSidebar}
          </Box>
        </LayoutColumns>
      )}

      <NovoEventoModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        dataInicial={dataSelecionada}
      />
    </PageScaffold>
  );
}
