"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionIcon from "@mui/icons-material/Description";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import PageTitle from "@/components/pageTitle/pageTitle";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Comunicado {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  categoria: "Evento" | "Administrativo" | "Calendário" | "Atualização RH" | "Tarefa";
  anexoUrl?: string;
  imagemUrl?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const COMUNICADOS_MOCK: Comunicado[] = [
  {
    id: "1",
    titulo: "Reunião de pais 06/12",
    descricao:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas auctor enim lectus, ut convallis arcu molestie nec. Donec eu mauris pulvinar, imperdiet elit et, feugiat nisl. Aliquam interdum diam lacus.",
    data: "14/01/25",
    categoria: "Evento",
    imagemUrl: "/placeholder-image.jpg",
    anexoUrl: "/docs/reuniao-pais.pdf",
  },
  {
    id: "2",
    titulo: "Atualização de horários 2025",
    descricao:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas auctor enim lectus, ut convallis arcu molestie nec. Donec eu mauris pulvinar, imperdiet elit et, feugiat nisl. Aliquam interdum diam lacus.",
    data: "12/01/25",
    categoria: "Calendário",
    anexoUrl: "/docs/horarios-2025.pdf",
  },
  {
    id: "3",
    titulo: "Nova política de benefícios",
    descricao:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas auctor enim lectus, ut convallis arcu molestie nec. Donec eu mauris pulvinar, imperdiet elit et, feugiat nisl. Aliquam interdum diam lacus.",
    data: "10/01/25",
    categoria: "Atualização RH",
    anexoUrl: "/docs/beneficios.pdf",
  },
  {
    id: "4",
    titulo: "Cancelamento de aulas - 15/01",
    descricao:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas auctor enim lectus, ut convallis arcu molestie nec. Donec eu mauris pulvinar, imperdiet elit et, feugiat nisl. Aliquam interdum diam lacus.",
    data: "09/01/25",
    categoria: "Evento",
    anexoUrl: "/docs/cancelamento.pdf",
  },
  {
    id: "5",
    titulo: "Processo seletivo interno",
    descricao:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas auctor enim lectus, ut convallis arcu molestie nec. Donec eu mauris pulvinar, imperdiet elit et, feugiat nisl. Aliquam interdum diam lacus.",
    data: "08/01/25",
    categoria: "Administrativo",
    anexoUrl: "/docs/selecao.pdf",
  },
  {
    id: "6",
    titulo: "Calendário escolar atualizado",
    descricao:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas auctor enim lectus, ut convallis arcu molestie nec. Donec eu mauris pulvinar, imperdiet elit et, feugiat nisl. Aliquam interdum diam lacus.",
    data: "05/01/25",
    categoria: "Calendário",
    imagemUrl: "/placeholder-image.jpg",
    anexoUrl: "/docs/calendario.pdf",
  },
  {
    id: "7",
    titulo: "Manutenção no sistema - 20/01",
    descricao:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas auctor enim lectus, ut convallis arcu molestie nec. Donec eu mauris pulvinar, imperdiet elit et, feugiat nisl. Aliquam interdum diam lacus.",
    data: "03/01/25",
    categoria: "Administrativo",
    anexoUrl: "/docs/manutencao.pdf",
  },
  {
    id: "8",
    titulo: "Entrega do trabalho de Matemática",
    descricao:
      "Entregar o trabalho sobre funções de segundo grau até a data indicada. O trabalho deve conter introdução, desenvolvimento e conclusão, com no mínimo 5 páginas.",
    data: "20/01/25",
    categoria: "Tarefa",
  },
  {
    id: "9",
    titulo: "Redação — tema: Meio Ambiente",
    descricao:
      "Produzir uma redação dissertativa-argumentativa sobre os impactos das mudanças climáticas na sociedade contemporânea. Mínimo de 25 linhas.",
    data: "18/01/25",
    categoria: "Tarefa",
  },
];

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIAS_CONFIG: Record<
  Comunicado["categoria"],
  { cor: string; label: string }
> = {
  Evento: { cor: "#039be5", label: "Evento" },
  Administrativo: { cor: "#ef5350", label: "Administrativo" },
  Calendário: { cor: "#ab47bc", label: "Calendário" },
  "Atualização RH": { cor: "#43a047", label: "Atualização RH" },
  Tarefa: { cor: "#f57c00", label: "Tarefa" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuadroDeAvisosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("");

  const comunicadosFiltrados = useMemo(() => {
    return COMUNICADOS_MOCK.filter((com) => {
      const matchSearch =
        com.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        com.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategoria =
        !categoriaFiltro || com.categoria === categoriaFiltro;
      return matchSearch && matchCategoria;
    });
  }, [searchTerm, categoriaFiltro]);

  const contagemPorCategoria = useMemo(() => {
    const contagem: Record<string, number> = {};
    COMUNICADOS_MOCK.forEach((com) => {
      contagem[com.categoria] = (contagem[com.categoria] || 0) + 1;
    });
    return contagem;
  }, []);

  const handleDownload = (comunicado: Comunicado) => {
    console.log("Baixando anexo:", comunicado.titulo);
  };

  const hasActiveFilter = !!searchTerm || !!categoriaFiltro;

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", bgcolor: "#F7F8FA" }}>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: "F7F8FA",
          px: { xs: 3, md: 4 },
          pt: 4,
        }}
      >
        <Box sx={{ maxWidth: 1504, mx: "auto" }}>
          {/* Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PageTitle
              title="Quadro de Avisos"
              description="Acompanhe atualizações e comunicados importantes da escola"
            />
          </Box>
        </Box>
      </Box>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <Box sx={{ maxWidth: 1504, mx: "auto", p: { xs: 2, md: 4 } }}>
        {/* Search + filter row */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            mb: 3,
          }}
        >
          <TextField
            fullWidth
            placeholder="Buscar comunicados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 20, color: "text.disabled" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ bgcolor: "background.paper", borderRadius: 1 }}
          />

          <Select
            value={categoriaFiltro}
            onChange={(e: SelectChangeEvent) =>
              setCategoriaFiltro(e.target.value)
            }
            displayEmpty
            size="small"
            sx={{
              bgcolor: "background.paper",
              minWidth: { md: 220 },
              width: { xs: "100%", md: "auto" },
            }}
          >
            <MenuItem value="">Todas as categorias</MenuItem>
            {Object.entries(CATEGORIAS_CONFIG).map(([key, config]) => (
              <MenuItem key={key} value={key}>
                {config.label}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Two-column grid */}
        <Grid container spacing={3}>
          {/* ── Left: comunicado cards ─────────────────────────────────── */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {comunicadosFiltrados.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 6,
                    textAlign: "center",
                  }}
                >
                  <DescriptionIcon
                    sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                  />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Nenhum comunicado encontrado
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {hasActiveFilter
                      ? "Tente ajustar os filtros de busca"
                      : "Não há comunicados disponíveis no momento"}
                  </Typography>
                </Paper>
              ) : (
                comunicadosFiltrados.map((comunicado) => {
                  const config = CATEGORIAS_CONFIG[comunicado.categoria];
                  return (
                    <Paper
                      key={comunicado.id}
                      elevation={0}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        overflow: "hidden",
                        transition: "box-shadow 0.2s",
                        "&:hover": { boxShadow: 2 },
                      }}
                    >
                      {/* Optional image banner */}
                      {comunicado.imagemUrl && (
                        <Box
                          sx={{
                            height: 180,
                            bgcolor: "grey.400",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ImageIcon
                            sx={{ fontSize: 64, color: "grey.100", opacity: 0.7 }}
                          />
                        </Box>
                      )}

                      {/* Card header */}
                      <Box
                        sx={{
                          px: 3,
                          py: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight={500}
                          sx={{ flex: 1 }}
                        >
                          {comunicado.titulo}
                        </Typography>
                        <Chip
                          label={config.label}
                          size="small"
                          sx={{
                            bgcolor: config.cor,
                            color: "#fff",
                            fontWeight: 500,
                            flexShrink: 0,
                          }}
                        />
                      </Box>

                      {/* Card body */}
                      <Box sx={{ px: 3, py: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {comunicado.descricao}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {comunicado.data}
                          </Typography>

                          {comunicado.anexoUrl && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<DownloadIcon />}
                              onClick={() => handleDownload(comunicado)}
                              sx={{ textTransform: "none" }}
                            >
                              Baixar
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  );
                })
              )}
            </Box>
          </Grid>

          {/* ── Right: Visão geral sidebar ─────────────────────────────── */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 3,
                position: "sticky",
                top: 88,
              }}
            >
              <Typography variant="h6" fontWeight={500} gutterBottom>
                Visão geral
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Resumo de todos os comunicados
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {Object.entries(CATEGORIAS_CONFIG).map(([categoria, config]) => {
                  const count = contagemPorCategoria[categoria] || 0;
                  const isActive = categoriaFiltro === categoria;
                  return (
                    <Box
                      key={categoria}
                      onClick={() =>
                        setCategoriaFiltro(isActive ? "" : categoria)
                      }
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        px: 1.5,
                        py: 1,
                        borderRadius: 1,
                        cursor: "pointer",
                        bgcolor: isActive ? "action.selected" : "transparent",
                        "&:hover": { bgcolor: "action.hover" },
                        transition: "background-color 0.15s",
                      }}
                    >
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: 0.5,
                          bgcolor: config.cor,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{ flex: 1 }}
                      >
                        {config.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="text.secondary"
                      >
                        {count}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* Clear filters */}
              {hasActiveFilter && (
                <Button
                  fullWidth
                  variant="text"
                  color="inherit"
                  startIcon={<CloseIcon />}
                  onClick={() => {
                    setSearchTerm("");
                    setCategoriaFiltro("");
                  }}
                  sx={{
                    mt: 3,
                    bgcolor: "action.hover",
                    textTransform: "none",
                    "&:hover": { bgcolor: "action.selected" },
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
