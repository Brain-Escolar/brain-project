"use client";
import LayoutColumns from "@/components/layoutColumns/layoutColumns";
import PageTitle from "@/components/pageTitle/pageTitle";
import {
  Container,
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
} from "@mui/material";
import { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SyncIcon from "@mui/icons-material/Sync";
import AddIcon from "@mui/icons-material/Add";

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: "Avaliações" | "Provas" | "Reuniões" | "Feriados" | "Prazos";
  color: string;
}

const mockEvents: CalendarEvent[] = [
  { id: "1", title: "Evento", time: "7 - 9", type: "Avaliações", color: "#2196f3" },
  { id: "2", title: "Evento", time: "7 - 9", type: "Provas", color: "#f44336" },
  { id: "3", title: "Evento", time: "7 - 9", type: "Avaliações", color: "#2196f3" },
  { id: "4", title: "Evento", time: "7 - 9", type: "Provas", color: "#f44336" },
  { id: "5", title: "Evento", time: "7 - 9", type: "Avaliações", color: "#2196f3" },
  { id: "6", title: "Evento", time: "7 - 9", type: "Provas", color: "#f44336" },
];

const eventTypes = [
  { name: "Avaliações", color: "#2196f3", count: 8 },
  { name: "Provas", color: "#f44336", count: 8 },
  { name: "Reuniões", color: "#9c27b0", count: 8 },
  { name: "Feriados", color: "#4caf50", count: 8 },
  { name: "Prazos", color: "#ff9800", count: 8 },
];

const daysOfWeek = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
const monthDays = [
  { day: 29, isCurrentMonth: false },
  { day: 30, isCurrentMonth: false },
  { day: 1, isCurrentMonth: true },
  { day: 2, isCurrentMonth: true },
  { day: 3, isCurrentMonth: true },
  { day: 4, isCurrentMonth: true },
  { day: 5, isCurrentMonth: true },
  { day: 6, isCurrentMonth: true },
  { day: 7, isCurrentMonth: true },
  { day: 8, isCurrentMonth: true },
  { day: 9, isCurrentMonth: true, isToday: true },
  { day: 10, isCurrentMonth: true },
  { day: 11, isCurrentMonth: true },
  { day: 12, isCurrentMonth: true },
  { day: 13, isCurrentMonth: true },
  { day: 14, isCurrentMonth: true },
  { day: 15, isCurrentMonth: true },
  { day: 16, isCurrentMonth: true },
  { day: 17, isCurrentMonth: true },
  { day: 18, isCurrentMonth: true },
  { day: 19, isCurrentMonth: true },
  { day: 20, isCurrentMonth: true },
  { day: 21, isCurrentMonth: true },
  { day: 22, isCurrentMonth: true },
  { day: 23, isCurrentMonth: true },
  { day: 24, isCurrentMonth: true },
  { day: 25, isCurrentMonth: true },
  { day: 26, isCurrentMonth: true },
  { day: 27, isCurrentMonth: true },
  { day: 28, isCurrentMonth: true },
  { day: 29, isCurrentMonth: true },
  { day: 30, isCurrentMonth: true },
  { day: 31, isCurrentMonth: true },
  { day: 1, isCurrentMonth: false },
  { day: 2, isCurrentMonth: false },
];

const getEventsForDay = (day: number): CalendarEvent[] => {
  if ([3, 9, 10, 1].includes(day)) {
    return mockEvents.slice(0, 2);
  }
  return [];
};

export default function Calendario() {
  const [currentMonth] = useState("Maio 2025");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 2, md: 4 },
        px: { xs: 1, md: 3 },
      }}
    >
      <PageTitle title="Calendário" />
      <Typography
        variant="body1"
        color="text.secondary"
        gutterBottom
        sx={{
          mb: { xs: 2, md: 4 },
          fontSize: { xs: "0.875rem", md: "1rem" },
        }}
      >
        Gerencie seu calendário e seus compromissos
      </Typography>

      {isMobile ? (
        // Layout mobile - coluna única
        <Stack spacing={3}>
          {/* Calendário */}
          <Box>
            {/* Header do calendário - mobile */}
            <Stack spacing={2} sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                    HOJE
                  </Typography>
                  <IconButton size="small" sx={{ padding: "2px" }}>
                    <ArrowBackIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" sx={{ padding: "2px" }}>
                    <ArrowForwardIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="h6" sx={{ fontSize: "1.1rem" }}>
                  {currentMonth}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SyncIcon />}
                  sx={{
                    textTransform: "uppercase",
                    fontSize: "0.7rem",
                    flex: 1,
                  }}
                >
                  Sincronizar
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  sx={{
                    textTransform: "uppercase",
                    fontSize: "0.7rem",
                    flex: 1,
                  }}
                >
                  Adicionar
                </Button>
              </Stack>
            </Stack>

            {/* Grade do calendário - mobile */}
            <Card>
              <CardContent sx={{ p: 0 }}>
                {/* Cabeçalho dos dias da semana */}
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
                        p: 0.5,
                        textAlign: "center",
                        borderRight: index < 6 ? 1 : 0,
                        borderColor: "divider",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight="bold"
                        sx={{ fontSize: "0.6rem" }}
                      >
                        {day}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Dias do mês - mobile */}
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                  {monthDays.map((dayInfo, index) => {
                    const events = getEventsForDay(dayInfo.day);
                    return (
                      <Box
                        key={index}
                        sx={{
                          minHeight: 60,
                          p: 0.5,
                          borderRight: (index + 1) % 7 !== 0 ? 1 : 0,
                          borderBottom: index < monthDays.length - 7 ? 1 : 0,
                          borderColor: "divider",
                          bgcolor: !dayInfo.isCurrentMonth ? "grey.50" : "transparent",
                          position: "relative",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: dayInfo.isToday
                              ? "white"
                              : !dayInfo.isCurrentMonth
                                ? "text.disabled"
                                : "text.primary",
                            fontWeight: dayInfo.isToday ? "bold" : "normal",
                            bgcolor: dayInfo.isToday ? "primary.main" : "transparent",
                            width: dayInfo.isToday ? 16 : "auto",
                            height: dayInfo.isToday ? 16 : "auto",
                            borderRadius: dayInfo.isToday ? "50%" : 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                          }}
                        >
                          {dayInfo.day}
                        </Typography>

                        {/* Eventos do dia - mobile (apenas indicador) */}
                        {events.length > 0 && (
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
                            {events.slice(0, 2).map((event) => (
                              <Box
                                key={event.id}
                                sx={{
                                  width: 4,
                                  height: 4,
                                  borderRadius: "50%",
                                  bgcolor: event.color,
                                }}
                              />
                            ))}
                            {events.length > 2 && (
                              <Typography sx={{ fontSize: "6px", color: "text.secondary" }}>
                                +{events.length - 2}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Sidebar de eventos - mobile */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontSize: "1.1rem" }}>
              Filtros de Eventos
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1 }}>
              {eventTypes.map((eventType) => (
                <FormControlLabel
                  key={eventType.name}
                  control={<Checkbox defaultChecked size="small" />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          bgcolor: eventType.color,
                          borderRadius: 1,
                        }}
                      />
                      <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                        {eventType.name} ({eventType.count})
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0 }}
                />
              ))}
            </Box>
          </Box>
        </Stack>
      ) : (
        // Layout desktop - duas colunas
        <LayoutColumns sizeLeft="70%" sizeRight="30%">
          {/* Calendário principal */}
          <Box>
            {/* Header do calendário */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  HOJE
                </Typography>
                <IconButton size="small">
                  <ArrowBackIcon />
                </IconButton>
                <IconButton size="small">
                  <ArrowForwardIcon />
                </IconButton>
                <Typography variant="h6" sx={{ ml: 2 }}>
                  {currentMonth}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SyncIcon />}
                  sx={{ textTransform: "uppercase" }}
                >
                  Sincronizar
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  sx={{ textTransform: "uppercase" }}
                >
                  Adicionar Evento
                </Button>
              </Box>
            </Box>

            {/* Grade do calendário */}
            <Card>
              <CardContent sx={{ p: 0 }}>
                {/* Cabeçalho dos dias da semana */}
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
                        p: 2,
                        textAlign: "center",
                        borderRight: index < 6 ? 1 : 0,
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        {day}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Dias do mês */}
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                  {monthDays.map((dayInfo, index) => {
                    const events = getEventsForDay(dayInfo.day);
                    return (
                      <Box
                        key={index}
                        sx={{
                          minHeight: 120,
                          p: 1,
                          borderRight: (index + 1) % 7 !== 0 ? 1 : 0,
                          borderBottom: index < monthDays.length - 7 ? 1 : 0,
                          borderColor: "divider",
                          bgcolor: !dayInfo.isCurrentMonth ? "grey.50" : "transparent",
                          position: "relative",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: dayInfo.isToday
                              ? "white"
                              : !dayInfo.isCurrentMonth
                                ? "text.disabled"
                                : "text.primary",
                            fontWeight: dayInfo.isToday ? "bold" : "normal",
                            bgcolor: dayInfo.isToday ? "primary.main" : "transparent",
                            width: dayInfo.isToday ? 24 : "auto",
                            height: dayInfo.isToday ? 24 : "auto",
                            borderRadius: dayInfo.isToday ? "50%" : 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {dayInfo.day}
                        </Typography>

                        {/* Eventos do dia */}
                        <Stack spacing={0.5} sx={{ mt: 1 }}>
                          {events.map((event) => (
                            <Box
                              key={event.id}
                              sx={{
                                fontSize: "10px",
                                p: 0.5,
                                borderRadius: 1,
                                bgcolor: event.color,
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  bgcolor: "white",
                                }}
                              />
                              <Typography variant="caption" sx={{ fontSize: "10px" }}>
                                {event.title} {event.time}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Sidebar - Eventos */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Eventos
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Filtre os eventos do calendário
            </Typography>

            <Stack spacing={2}>
              {eventTypes.map((eventType) => (
                <FormControlLabel
                  key={eventType.name}
                  control={<Checkbox defaultChecked size="small" />}
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
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            bgcolor: eventType.color,
                            borderRadius: 1,
                          }}
                        />
                        <Typography variant="body2">{eventType.name}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        ({eventType.count})
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, width: "100%" }}
                />
              ))}
            </Stack>
          </Box>
        </LayoutColumns>
      )}
    </Container>
  );
}
