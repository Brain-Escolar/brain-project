"use client";

import TarefaCard from "@/components/tarefaCard/TarefaCard";
import { useAulaTarefa } from "@/hooks/useAulaTarefa";
import { aulaApi } from "@/services/api";
import { AulaAlunoResponse, AulaInfoResponse } from "@/services/domains/aula/response";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/pt-br";
import dayjs, { Dayjs } from "dayjs";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Image from "next/image";

dayjs.locale("pt-br");

const DATE_FORMAT = "YYYY-MM-DD";

export default function TarefasPorAulaPage() {
  const router = useRouter();
  const { id: aulaId } = useParams<{ id: string }>();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const { data: aula, isLoading: loadingAula } = useQuery<AulaInfoResponse>({
    queryKey: QUERY_KEYS.aulas.detail(aulaId),
    queryFn: () => aulaApi.getAulaById(aulaId),
    enabled: !!aulaId,
    staleTime: 10 * 60 * 1000,
  });

  const { data: alunos, isLoading: loadingAlunos } = useQuery<AulaAlunoResponse[]>({
    queryKey: [...QUERY_KEYS.aulas.detail(aulaId), "alunos"],
    queryFn: () => aulaApi.listaAlunosByIdAula(aulaId),
    enabled: !!aulaId,
    staleTime: 10 * 60 * 1000,
  });

  const { tarefas, datasComTarefas, loading: loadingTarefas } = useAulaTarefa(
    aulaId,
    selectedDate.format(DATE_FORMAT),
  );

  const availableDates = new Set(datasComTarefas);
  const headerLoading = loadingAula || loadingAlunos;
  const formattedDate = selectedDate.format("D [de] MMMM [de] YYYY");

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 860, mx: "auto" }}>

        {/* ── Back link ── */}
        <Box
          component="button"
          onClick={() => router.back()}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mb: 1.5,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "text.secondary",
            p: 0,
            "&:hover": { color: "text.primary" },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} />
          <Typography variant="body2">Página inicial</Typography>
        </Box>

        {/* ── Header (no card) ── */}
        {headerLoading ? (
          <Box sx={{ display: "flex", alignItems: "center", py: 1, mb: 2 }}>
            <CircularProgress size={20} />
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2.5,
              gap: 2,
            }}
          >
            {/* Left: image + title */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1,
                  overflow: "hidden",
                  flexShrink: 0,
                  bgcolor: "grey.200",
                }}
              >
                <Image
                  src="https://placehold.co/44.png"
                  alt="Disciplina"
                  width={44}
                  height={44}
                  style={{ objectFit: "cover" }}
                />
              </Box>
              <Typography variant="h6" fontWeight={700} noWrap>
                {aula?.disciplina ?? "—"}
                {aula?.turma ? ` — ${aula.turma}` : ""}
              </Typography>
            </Box>

            {/* Right: meta info */}
            <Stack direction="row" alignItems="center" spacing={2} flexShrink={0}>
              {aula?.horarioInicio && aula?.horarioFim && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {aula.horarioInicio} – {aula.horarioFim}
                  </Typography>
                </Box>
              )}
              {aula?.sala && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <RoomOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {aula.sala}
                  </Typography>
                </Box>
              )}
              {aula?.unidade && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {aula.unidade}
                </Typography>
              )}
              {alunos !== undefined && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <PeopleOutlineIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {alunos.length} {alunos.length === 1 ? "estudante" : "estudantes"}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        )}

        {/* ── Date navigation (no card) ── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2.5 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSelectedDate(dayjs())}
            sx={{ textTransform: "none", fontWeight: 600, minWidth: "auto", mr: 0.5 }}
          >
            HOJE
          </Button>

          <IconButton size="small" onClick={() => setSelectedDate((p) => p.subtract(1, "day"))}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setSelectedDate((p) => p.add(1, "day"))}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>

          <Tooltip title="Selecionar data">
            <IconButton size="small" onClick={() => setDatePickerOpen(true)}>
              <CalendarMonthIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 500 }}>
            {formattedDate}
          </Typography>

          {/* Hidden DatePicker triggered by calendar icon */}
          <Box sx={{ width: 0, overflow: "hidden" }}>
            <DatePicker
              open={datePickerOpen}
              onClose={() => setDatePickerOpen(false)}
              value={selectedDate}
              onChange={(v) => { if (v) setSelectedDate(v as Dayjs); }}
              shouldDisableDate={(d) => !availableDates.has((d as Dayjs).format(DATE_FORMAT))}
              slotProps={{
                textField: { size: "small", sx: { width: 0, p: 0, opacity: 0 } },
              }}
            />
          </Box>
        </Box>

        {/* ── Big outer card: Conteúdo do dia + Novas tarefas ── */}
        <Paper variant="outlined" sx={{ borderRadius: 2, borderColor: "grey.200", p: 3 }}>

          {/* Conteúdo do dia — placeholder until backend provides it */}
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Conteúdo do dia
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            —
          </Typography>

          {/* Novas tarefas */}
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Novas tarefas
          </Typography>

          {loadingTarefas ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : tarefas.length === 0 ? (
            <Box
              sx={{
                py: 5,
                textAlign: "center",
                color: "text.secondary",
                borderRadius: 2,
                border: "1px dashed",
                borderColor: "grey.300",
              }}
            >
              <Typography variant="body2">Nenhuma tarefa para esta data.</Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {tarefas.map((tarefa) => (
                <TarefaCard key={tarefa.id} tarefa={tarefa} />
              ))}
            </Stack>
          )}
        </Paper>

      </Box>
    </LocalizationProvider>
  );
}
