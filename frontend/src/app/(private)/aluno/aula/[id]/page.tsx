"use client";

import TarefaCard from "@/components/tarefaCard/TarefaCard";
import { useAulaTarefa } from "@/hooks/useAulaTarefa";
import { useMateriaisComplementaresAluno } from "@/hooks/useMateriaisComplementaresAluno";
import { aulaApi, conteudoApi } from "@/services/api";
import { AulaInfoResponse } from "@/services/domains/aula/response";
import { ConteudoResponse } from "@/services/domains/conteudo";
import { MaterialComplementarResponse } from "@/services/domains/material-complementar";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { RoutesEnum } from "@/enums";
import {
  formatProfessorLabel,
  getDisciplinaIcon,
  getDisciplinaTileColors,
} from "@/utils/disciplinaUtils";
import {
  Avatar,
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
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";

dayjs.locale("pt-br");

const DATE_FORMAT = "YYYY-MM-DD";

const cardSx = {
  borderRadius: "14px",
  borderColor: "var(--colors-borderSubtle)",
  bgcolor: "var(--colors-backgroundSection)",
  boxShadow: "var(--shadows-level1)",
} as const;

function formatTamanho(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function materialIcon(material: MaterialComplementarResponse) {
  if (material.tipo === "LINK") return <LinkOutlinedIcon sx={{ fontSize: 19 }} />;
  const contentType = material.arquivo?.contentType ?? "";
  if (contentType.includes("pdf")) return <PictureAsPdfOutlinedIcon sx={{ fontSize: 19 }} />;
  if (contentType.startsWith("video")) return <PlayCircleOutlineIcon sx={{ fontSize: 19 }} />;
  return <ArticleOutlinedIcon sx={{ fontSize: 19 }} />;
}

function materialMeta(material: MaterialComplementarResponse): string {
  if (material.tipo === "LINK") return material.dominio || "Link externo";
  if (!material.arquivo) return "Arquivo";
  const contentType = material.arquivo.contentType ?? "";
  const label = contentType.includes("pdf")
    ? "PDF"
    : contentType.startsWith("video")
      ? "Vídeo"
      : "Arquivo";
  return `${label} · ${formatTamanho(material.arquivo.tamanho)}`;
}

function SectionMateriais({ disciplina }: { disciplina?: string }) {
  const { materiais, loading } = useMateriaisComplementaresAluno();
  const router = useRouter();

  const daDisciplina = disciplina
    ? materiais.filter((m) => m.disciplinaNome === disciplina)
    : [];
  const visiveis = daDisciplina.slice(0, 4);

  const handleOpen = (material: MaterialComplementarResponse) => {
    const url = material.tipo === "LINK" ? material.url : material.arquivo?.downloadUrl;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Paper variant="outlined" sx={{ ...cardSx, p: 2.5 }}>
      <Typography sx={{ fontSize: 16, fontWeight: 600 }}>Materiais complementares</Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={18} />
        </Box>
      ) : visiveis.length === 0 ? (
        <Typography sx={{ mt: 1.5, fontSize: 13.5, color: "var(--colors-textTertiary)" }}>
          Nenhum material publicado para esta disciplina.
        </Typography>
      ) : (
        <Stack spacing={0.75} sx={{ mt: 1.5 }}>
          {visiveis.map((material) => (
            <Box
              key={material.id}
              component="button"
              onClick={() => handleOpen(material)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.25,
                borderRadius: "10px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                fontFamily: "inherit",
                "&:hover": { background: "var(--colors-backgroundHover)" },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "var(--colors-surfaceSunken)",
                  color: "var(--colors-textSecondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {materialIcon(material)}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 13.5,
                    fontWeight: 500,
                    lineHeight: 1.3,
                    color: "var(--colors-text)",
                  }}
                >
                  {material.titulo}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "var(--colors-textTertiary)", mt: 0.25 }}>
                  {materialMeta(material)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      )}

      {daDisciplina.length > 0 && (
        <Button
          size="small"
          sx={{ mt: 1, textTransform: "none", fontWeight: 600 }}
          onClick={() => router.push(RoutesEnum.MATERIAIS_COMPLEMENTARES)}
        >
          Ver todos
        </Button>
      )}
    </Paper>
  );
}

function SectionProfessor({ aula }: { aula: AulaInfoResponse }) {
  const router = useRouter();

  return (
    <Paper variant="outlined" sx={{ ...cardSx, p: 2.5 }}>
      <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1.75 }}>Professor(a)</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ width: 40, height: 40, fontSize: 15 }}>
          {aula.professor?.charAt(0).toUpperCase() ?? "P"}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
            {formatProfessorLabel(aula.professor)}
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: "var(--colors-textSecondary)" }}>
            {aula.disciplina} · {aula.serie} {aula.turma}
          </Typography>
        </Box>
      </Box>
      <Button
        variant="outlined"
        size="small"
        fullWidth
        startIcon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
        sx={{ mt: 1.75, textTransform: "none", fontWeight: 600 }}
        onClick={() => router.push(RoutesEnum.COMUNICACAO)}
      >
        Enviar dúvida
      </Button>
    </Paper>
  );
}

export default function DetalheAulaAlunoPage() {
  const router = useRouter();
  const { id: aulaId } = useParams<{ id: string }>();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const dataSelecionada = selectedDate.format(DATE_FORMAT);

  const { data: aula, isLoading: loadingAula } = useQuery<AulaInfoResponse>({
    queryKey: QUERY_KEYS.aulas.detail(aulaId),
    queryFn: () => aulaApi.getAulaById(aulaId),
    enabled: !!aulaId,
    staleTime: 10 * 60 * 1000,
  });

  const { data: conteudo, isLoading: loadingConteudo } = useQuery<ConteudoResponse | null>({
    queryKey: QUERY_KEYS.conteudos.porAulaData(aulaId, dataSelecionada),
    queryFn: () =>
      conteudoApi.buscarPorAulaData(Number(aulaId), dataSelecionada).catch((err) => {
        if (err?.status === 404 || err?.response?.status === 404) return null;
        throw err;
      }),
    enabled: !!aulaId,
    retry: false,
  });

  const { tarefas, datasComTarefas, loading: loadingTarefas } = useAulaTarefa(
    aulaId,
    dataSelecionada,
  );

  const availableDates = new Set(datasComTarefas);
  const formattedDate = selectedDate.format("D [de] MMMM [de] YYYY");
  const dataLongaRaw = selectedDate.format("dddd, D [de] MMMM");
  const dataLonga = dataLongaRaw.charAt(0).toUpperCase() + dataLongaRaw.slice(1);

  const tileColors = aula ? getDisciplinaTileColors(aula.disciplina) : null;
  const DisciplinaIcon = aula ? getDisciplinaIcon(aula.disciplina) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1080, mx: "auto" }}>
        {/* ── Back link ── */}
        <Box
          component="button"
          onClick={() => router.back()}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mb: 1.75,
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

        {/* ── Header: tile da disciplina + título + meta ── */}
        {loadingAula ? (
          <Box sx={{ display: "flex", alignItems: "center", py: 1, mb: 2 }}>
            <CircularProgress size={20} />
          </Box>
        ) : (
          aula && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.75, mb: 2.5, minWidth: 0 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  bgcolor: tileColors?.bg,
                  color: tileColors?.color,
                }}
              >
                {DisciplinaIcon && <DisciplinaIcon sx={{ fontSize: 28, color: "inherit" }} />}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" fontWeight={700} noWrap sx={{ letterSpacing: "-0.01em" }}>
                  {aula.disciplina}
                  {aula.serie || aula.turma
                    ? ` — ${[aula.serie, aula.turma].filter(Boolean).join(" ")}`
                    : ""}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 0.5, flexWrap: "wrap" }}>
                  {aula.horarioInicio && aula.horarioFim && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {aula.horarioInicio} – {aula.horarioFim}
                      </Typography>
                    </Box>
                  )}
                  {aula.sala && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <RoomOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        Sala {aula.sala}
                      </Typography>
                    </Box>
                  )}
                  {aula.professor && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <PersonOutlineOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {formatProfessorLabel(aula.professor)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Box>
          )
        )}

        {/* ── Date navigation ── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2.5 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSelectedDate(dayjs())}
            sx={{ textTransform: "none", fontWeight: 600, minWidth: "auto", mr: 0.5 }}
          >
            Hoje
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

        {/* ── Duas colunas: conteúdo/tarefas + sidebar ── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 320px" },
            gap: 3,
            alignItems: "start",
          }}
        >
          <Stack spacing={2.5}>
            {/* Conteúdo do dia */}
            <Paper variant="outlined" sx={{ ...cardSx, p: 3 }}>
              <Typography
                sx={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--colors-textTertiary)",
                }}
              >
                Conteúdo do dia · {dataLonga}
              </Typography>
              {loadingConteudo ? (
                <Box sx={{ display: "flex", py: 2 }}>
                  <CircularProgress size={18} />
                </Box>
              ) : conteudo?.conteudo ? (
                <Typography
                  sx={{
                    fontSize: 14.5,
                    lineHeight: 1.6,
                    color: "var(--colors-textSecondary)",
                    mt: 1.25,
                    whiteSpace: "pre-line",
                  }}
                >
                  {conteudo.conteudo}
                </Typography>
              ) : (
                <Typography
                  sx={{ fontSize: 14.5, color: "var(--colors-textTertiary)", mt: 1.25 }}
                >
                  O conteúdo desta aula ainda não foi publicado pelo professor.
                </Typography>
              )}
            </Paper>

            {/* Tarefas desta aula */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <Typography sx={{ fontSize: 16, fontWeight: 600 }}>Tarefas desta aula</Typography>
                <Box
                  component="span"
                  sx={{
                    minWidth: 20,
                    height: 20,
                    borderRadius: "999px",
                    bgcolor: "var(--colors-primarySubtle)",
                    color: "var(--colors-primary)",
                    fontSize: 12,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 0.75,
                  }}
                >
                  {tarefas.length}
                </Box>
              </Box>

              {loadingTarefas ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : tarefas.length === 0 ? (
                <Box
                  sx={{
                    py: 4,
                    textAlign: "center",
                    color: "text.secondary",
                    borderRadius: "14px",
                    border: "1px dashed",
                    borderColor: "var(--colors-border)",
                  }}
                >
                  <Typography variant="body2">Nenhuma tarefa para esta data.</Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {tarefas.map((tarefa) => (
                    <TarefaCard key={tarefa.id} tarefa={tarefa} />
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>

          {/* Sidebar */}
          <Stack spacing={2.5}>
            <SectionMateriais disciplina={aula?.disciplina} />
            {aula && <SectionProfessor aula={aula} />}
          </Stack>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
