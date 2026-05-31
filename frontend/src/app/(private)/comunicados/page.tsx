"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
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
import { useComunicados } from "@/hooks/useComunicados";
import { ComunicadoCategoria } from "@/services/domains/comunicado/response";

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIAS_CONFIG = {
  Evento: { cor: "#039be5", label: "Evento" },
  Administrativo: { cor: "#ef5350", label: "Administrativo" },
  Calendário: { cor: "#ab47bc", label: "Calendário" },
  "Atualização RH": { cor: "#43a047", label: "Atualização RH" },
} as const;

type CategoriaKey = keyof typeof CATEGORIAS_CONFIG;

// Maps backend enum → display key
const CATEGORIA_ENUM_MAP: Record<ComunicadoCategoria, CategoriaKey> = {
  EVENTO: "Evento",
  ADMINISTRATIVO: "Administrativo",
  CALENDARIO: "Calendário",
  ATUALIZACAO_RH: "Atualização RH",
};

// ─── Unified item type ────────────────────────────────────────────────────────

interface AvisoItem {
  id: string;
  titulo: string;
  descricao: string;
  data: string; // DD/MM/YY
  categoria: CategoriaKey;
  imagemUrl?: string;
  anexoUrl?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  // "YYYY-MM-DD" → "DD/MM/YY"
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year.slice(2)}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ComunicadosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("");

  const { comunicados, loading, error } = useComunicados(0, 100);

  // Map comunicados into unified list, sorted by date desc
  const allAvisos = useMemo<AvisoItem[]>(() => {
    const mapped: AvisoItem[] = comunicados.map((c) => ({
      id: `c-${c.id}`,
      titulo: c.titulo,
      descricao: c.conteudo,
      data: c.data ? formatDate(c.data) : "",
      categoria: (c.categoria ? CATEGORIA_ENUM_MAP[c.categoria] : "Administrativo") as CategoriaKey,
      imagemUrl: c.imagemUrl,
      anexoUrl: c.anexoUrl,
    }));

    return mapped.sort((a, b) => {
      const dateA = a.data.split("/").reverse().join("");
      const dateB = b.data.split("/").reverse().join("");
      return dateB.localeCompare(dateA);
    });
  }, [comunicados]);

  const avisosFiltrados = useMemo(() => {
    return allAvisos.filter((aviso) => {
      const matchSearch =
        aviso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aviso.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategoria = !categoriaFiltro || aviso.categoria === categoriaFiltro;
      return matchSearch && matchCategoria;
    });
  }, [allAvisos, searchTerm, categoriaFiltro]);

  const contagemPorCategoria = useMemo(() => {
    const contagem: Record<string, number> = {};
    allAvisos.forEach((aviso) => {
      contagem[aviso.categoria] = (contagem[aviso.categoria] || 0) + 1;
    });
    return contagem;
  }, [allAvisos]);

  const hasActiveFilter = !!searchTerm || !!categoriaFiltro;

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", bgcolor: "#F7F8FA" }}>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: "#F7F8FA", px: { xs: 3, md: 4 }, pt: 4 }}>
        <Box sx={{ maxWidth: 1504, mx: "auto" }}>
          <PageTitle
            title="Comunicados"
            description="Acompanhe atualizações e comunicados importantes da escola"
          />
        </Box>
      </Box>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <Box sx={{ maxWidth: 1504, mx: "auto", p: { xs: 2, md: 4 } }}>

        {/* Loading state */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error state */}
        {!loading && error && (
          <Typography color="error" textAlign="center" sx={{ py: 8 }}>
            Erro ao carregar os comunicados. Tente recarregar a página.
          </Typography>
        )}

        {/* Main content */}
        {!loading && !error && (
          <>
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
                onChange={(e: SelectChangeEvent) => setCategoriaFiltro(e.target.value)}
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
              {/* ── Left: comunicado cards ─────────────────────────────── */}
              <Grid size={{ xs: 12, lg: 8 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {avisosFiltrados.length === 0 ? (
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
                      <DescriptionIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
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
                    avisosFiltrados.map((aviso) => {
                      const config = CATEGORIAS_CONFIG[aviso.categoria];
                      return (
                        <Paper
                          key={aviso.id}
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
                          {aviso.imagemUrl && (
                            <Box
                              sx={{
                                height: 180,
                                bgcolor: "grey.400",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <ImageIcon sx={{ fontSize: 64, color: "grey.100", opacity: 0.7 }} />
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
                            <Typography variant="h6" fontWeight={500} sx={{ flex: 1 }}>
                              {aviso.titulo}
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
                              {aviso.descricao}
                            </Typography>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography variant="caption" color="text.secondary">
                                {aviso.data}
                              </Typography>

                              {aviso.anexoUrl && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  startIcon={<DownloadIcon />}
                                  href={aviso.anexoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
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

              {/* ── Right: Visão geral sidebar ─────────────────────────── */}
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
                          onClick={() => setCategoriaFiltro(isActive ? "" : categoria)}
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
                          <Typography variant="body2" color="text.primary" sx={{ flex: 1 }}>
                            {config.label}
                          </Typography>
                          <Typography variant="body2" fontWeight={700} color="text.secondary">
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
          </>
        )}
      </Box>
    </Box>
  );
}
