"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import GroupsIcon from "@mui/icons-material/Groups";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import SegmentedControl from "@/components/segmentedControl/segmentedControl";
import { RoutesEnum } from "@/enums";
import { useAlunos } from "@/hooks/useAlunos";
import { useTurmas } from "@/hooks/useTurmas";
import { useSeries } from "@/hooks/useSeries";
import { useUnidades } from "@/hooks/useUnidades";
import { AlunoListaResponse } from "@/services/domains/aluno/response";
import { TurmaListaResponse } from "@/services/domains/turma/response";
import { alunoApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";

type View = "porAluno" | "porTurma";
type Situacao = "Todos" | "Sem turma" | "Enturmado";

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export default function EnturmacaoPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [view, setView] = useState<View>("porAluno");

  const [busca, setBusca] = useState("");
  const [filtroSerie, setFiltroSerie] = useState("Todas");
  const [filtroSituacao, setFiltroSituacao] = useState<Situacao>("Todos");

  const [buscaTurma, setBuscaTurma] = useState("");
  const [filtroSerieTurma, setFiltroSerieTurma] = useState("Todas");
  const [filtroUnidadeTurma, setFiltroUnidadeTurma] = useState("Todas");
  const [filtroTurno, setFiltroTurno] = useState("Todos");

  const [ctxAluno, setCtxAluno] = useState<AlunoListaResponse | null>(null);
  const [turmaSelecionada, setTurmaSelecionada] = useState<number | null>(null);
  const [modalVincularAberto, setModalVincularAberto] = useState(false);

  const { alunos, loading: loadingAlunos } = useAlunos();
  const { turmas, loading: loadingTurmas } = useTurmas();
  const { series } = useSeries();
  const { unidades } = useUnidades();

  const turnos = useMemo(
    () => Array.from(new Set(turmas.map((t) => t.turno).filter(Boolean))),
    [turmas],
  );

  const vincularMutation = useMutation({
    mutationFn: (turma: TurmaListaResponse) =>
      alunoApi.vincularSerie(String(ctxAluno!.id), {
        serieId: turma.serieId!,
        unidadeId: turma.unidadeId!,
        turmaId: turma.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.turmas.lists() });
      toast.success("Turma vinculada com sucesso!");
      fecharVincular();
    },
    onError: () => {
      toast.error("Erro ao vincular turma. Tente novamente.");
    },
  });

  function abrirVincular(aluno: AlunoListaResponse) {
    setCtxAluno(aluno);
    setTurmaSelecionada(aluno.turmaId ?? null);
    setModalVincularAberto(true);
  }

  function fecharVincular() {
    setModalVincularAberto(false);
    setCtxAluno(null);
    setTurmaSelecionada(null);
  }

  function confirmarVincular() {
    if (turmaSelecionada == null) return;
    const turma = turmas.find((t) => t.id === turmaSelecionada);
    if (!turma) return;
    vincularMutation.mutate(turma);
  }

  const kpiSemTurma = alunos.filter((a) => !a.turmaId).length;
  const kpiEnturmados = alunos.filter((a) => !!a.turmaId).length;
  const kpiVagas = turmas.reduce((acc, t) => acc + Math.max(0, (t.vagas ?? 0) - (t.ocupadas ?? 0)), 0);

  const alunosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return alunos
      .filter((a) => {
        const matchBusca =
          !q || a.nome.toLowerCase().includes(q) || (a.matricula ?? "").toLowerCase().includes(q);
        const matchSerie = filtroSerie === "Todas" || a.serie === filtroSerie;
        const matchSituacao =
          filtroSituacao === "Todos" || (filtroSituacao === "Sem turma" ? !a.turmaId : !!a.turmaId);
        return matchBusca && matchSerie && matchSituacao;
      })
      .slice()
      .sort((a, b) => (a.turmaId ? 1 : 0) - (b.turmaId ? 1 : 0) || a.nome.localeCompare(b.nome));
  }, [alunos, busca, filtroSerie, filtroSituacao]);

  const turmasFiltradas = useMemo(() => {
    const q = buscaTurma.trim().toLowerCase();
    return turmas.filter(
      (t) =>
        (filtroSerieTurma === "Todas" || t.serie === filtroSerieTurma) &&
        (filtroUnidadeTurma === "Todas" || t.unidade === filtroUnidadeTurma) &&
        (filtroTurno === "Todos" || t.turno === filtroTurno) &&
        (!q || t.nome.toLowerCase().includes(q)),
    );
  }, [turmas, buscaTurma, filtroSerieTurma, filtroUnidadeTurma, filtroTurno]);

  // Só turmas da mesma série + unidade do aluno podem recebê-lo (regra M4/T4).
  const turmasDoAluno = useMemo(() => {
    if (!ctxAluno) return [];
    return turmas.filter((t) => t.serieId === ctxAluno.serieId && t.unidadeId === ctxAluno.unidadeId);
  }, [turmas, ctxAluno]);

  const loading = loadingAlunos || loadingTurmas;

  return (
    <PageScaffold
      title="Enturmação"
      description="Enturme alunos matriculados, altere a turma de quem já está alocado e acompanhe a ocupação."
    >
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
        <KpiCard label="Aguardando enturmação" value={kpiSemTurma} color="warning.main" />
        <KpiCard label="Alunos enturmados" value={kpiEnturmados} />
        <KpiCard label="Vagas disponíveis" value={kpiVagas} color="primary.main" />
      </Box>

      <Box sx={{ mb: 2 }}>
        <SegmentedControl
          ariaLabel="Visualizar por aluno ou por turma"
          value={view}
          onChange={setView}
          options={[
            { value: "porAluno", label: "Por aluno" },
            { value: "porTurma", label: "Por turma" },
          ]}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : view === "porAluno" ? (
        <>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mb: 2 }}>
            <TextField
              size="small"
              placeholder="Buscar por nome ou matrícula"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              sx={{ minWidth: 260 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Select size="small" value={filtroSerie} onChange={(e) => setFiltroSerie(e.target.value)}>
              <MenuItem value="Todas">Todas as séries</MenuItem>
              {series.map((s) => (
                <MenuItem key={s.id} value={s.nome}>
                  {s.nome}
                </MenuItem>
              ))}
            </Select>
            <Select
              size="small"
              value={filtroSituacao}
              onChange={(e) => setFiltroSituacao(e.target.value as Situacao)}
            >
              <MenuItem value="Todos">Todas as situações</MenuItem>
              <MenuItem value="Sem turma">Sem turma</MenuItem>
              <MenuItem value="Enturmado">Enturmados</MenuItem>
            </Select>
          </Box>

          <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
            {alunosFiltrados.length === 0 ? (
              <EmptyState mensagem="Nenhum aluno encontrado." />
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Aluno</TableCell>
                    <TableCell>Matrícula</TableCell>
                    <TableCell>Série</TableCell>
                    <TableCell>Turma atual</TableCell>
                    <TableCell>Situação</TableCell>
                    <TableCell align="right">Ação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alunosFiltrados.map((aluno) => {
                    const semTurma = !aluno.turmaId;
                    return (
                      <TableRow
                        key={aluno.id}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => router.push(`${RoutesEnum.ALUNO_DETALHE}/${aluno.id}`)}
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>
                              {iniciais(aluno.nome)}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {aluno.nome}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontFamily: "monospace" }}>{aluno.matricula}</TableCell>
                        <TableCell>{aluno.serie}</TableCell>
                        <TableCell sx={{ color: semTurma ? "text.secondary" : "text.primary" }}>
                          {semTurma ? "— sem turma" : aluno.turma}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={semTurma ? "Sem turma" : "Enturmado"}
                            color={semTurma ? "warning" : "success"}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="small"
                            variant={semTurma ? "contained" : "outlined"}
                            startIcon={
                              semTurma ? <GroupAddIcon fontSize="small" /> : <SwapHorizIcon fontSize="small" />
                            }
                            onClick={() => abrirVincular(aluno)}
                          >
                            {semTurma ? "Enturmar" : "Alterar turma"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </>
      ) : (
        <>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mb: 2 }}>
            <TextField
              size="small"
              placeholder="Buscar turma"
              value={buscaTurma}
              onChange={(e) => setBuscaTurma(e.target.value)}
              sx={{ minWidth: 220 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Select size="small" value={filtroSerieTurma} onChange={(e) => setFiltroSerieTurma(e.target.value)}>
              <MenuItem value="Todas">Todas as séries</MenuItem>
              {series.map((s) => (
                <MenuItem key={s.id} value={s.nome}>
                  {s.nome}
                </MenuItem>
              ))}
            </Select>
            <Select
              size="small"
              value={filtroUnidadeTurma}
              onChange={(e) => setFiltroUnidadeTurma(e.target.value)}
            >
              <MenuItem value="Todas">Todas as unidades</MenuItem>
              {unidades.map((u) => (
                <MenuItem key={u.id} value={u.nome}>
                  {u.nome}
                </MenuItem>
              ))}
            </Select>
            <Select size="small" value={filtroTurno} onChange={(e) => setFiltroTurno(e.target.value)}>
              <MenuItem value="Todos">Todos os turnos</MenuItem>
              {turnos.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
            {turmasFiltradas.length === 0 ? (
              <EmptyState mensagem="Nenhuma turma encontrada com os filtros atuais." />
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Turma</TableCell>
                    <TableCell>Série</TableCell>
                    <TableCell>Unidade</TableCell>
                    <TableCell>Turno</TableCell>
                    <TableCell>Sala</TableCell>
                    <TableCell sx={{ minWidth: 170 }}>Ocupação</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {turmasFiltradas.map((turma) => {
                    const vagas = turma.vagas ?? 0;
                    const ocupadas = turma.ocupadas ?? 0;
                    const frac = vagas > 0 ? ocupadas / vagas : 0;
                    const lotada = vagas > 0 && ocupadas >= vagas;
                    const quaseCheia = !lotada && frac > 0.9;
                    const cor = lotada ? "error" : quaseCheia ? "warning" : "success";
                    return (
                      <TableRow
                        key={turma.id}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => router.push(`${RoutesEnum.SECRETARIA_TURMA_GERENCIAR}/${turma.id}`)}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {turma.nome}
                          </Typography>
                        </TableCell>
                        <TableCell>{turma.serie}</TableCell>
                        <TableCell sx={{ color: "text.secondary" }}>{turma.unidade}</TableCell>
                        <TableCell>{turma.turno}</TableCell>
                        <TableCell sx={{ color: "text.secondary" }}>{turma.sala ?? "—"}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Typography
                              variant="caption"
                              sx={{ fontFamily: "monospace", minWidth: 42, flexShrink: 0 }}
                            >
                              {ocupadas}/{vagas}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, Math.round(frac * 100))}
                              color={cor}
                              sx={{ flex: 1, maxWidth: 110, height: 6, borderRadius: 999 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={lotada ? "Lotada" : quaseCheia ? "Quase cheia" : "Com vagas"}
                            color={cor}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="small"
                            startIcon={<GroupsIcon fontSize="small" />}
                            onClick={() => router.push(`${RoutesEnum.SECRETARIA_TURMA_GERENCIAR}/${turma.id}`)}
                          >
                            Gerenciar alunos
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </>
      )}

      {/* Modal Vincular/Alterar turma */}
      <Dialog open={modalVincularAberto} onClose={fecharVincular} maxWidth="sm" fullWidth>
        <DialogTitle>{ctxAluno?.turmaId ? "Alterar turma" : "Vincular turma"}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Selecione a turma de <strong>{ctxAluno?.nome}</strong>.
          </DialogContentText>
          {turmasDoAluno.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhuma turma cadastrada para {ctxAluno?.serie} · {ctxAluno?.unidade}.
            </Typography>
          ) : (
            <RadioGroup
              value={turmaSelecionada ?? ""}
              onChange={(e) => setTurmaSelecionada(Number(e.target.value))}
            >
              {turmasDoAluno.map((t) => {
                const isAtual = t.id === ctxAluno?.turmaId;
                const lotada = t.ocupadas != null && t.vagas != null && t.ocupadas >= t.vagas;
                const disabled = lotada && !isAtual;
                return (
                  <FormControlLabel
                    key={t.id}
                    value={t.id}
                    disabled={disabled}
                    control={<Radio />}
                    sx={{
                      width: "100%",
                      ml: 0,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      py: 0.5,
                    }}
                    label={
                      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", gap: 2 }}>
                        <span>
                          {t.nome}
                          {isAtual ? " (atual)" : ""} — {t.turno}
                        </span>
                        <span style={{ fontVariantNumeric: "tabular-nums" }}>
                          {t.ocupadas ?? "—"}/{t.vagas ?? "—"}
                          {lotada ? " · Lotada" : ""}
                        </span>
                      </Box>
                    }
                  />
                );
              })}
            </RadioGroup>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharVincular} disabled={vincularMutation.isPending}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={confirmarVincular}
            disabled={turmaSelecionada == null || vincularMutation.isPending}
          >
            {vincularMutation.isPending ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageScaffold>
  );
}

function KpiCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Paper sx={{ p: 2.5, boxShadow: 1 }}>
      <Typography
        variant="caption"
        sx={{ textTransform: "uppercase", letterSpacing: 0.5, color: "text.secondary" }}
      >
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontFamily: "monospace", fontWeight: 600, mt: 0.5, color }}>
        {value}
      </Typography>
    </Paper>
  );
}

function EmptyState({ mensagem }: { mensagem: string }) {
  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="body2" color="text.secondary">
        {mensagem}
      </Typography>
    </Box>
  );
}
