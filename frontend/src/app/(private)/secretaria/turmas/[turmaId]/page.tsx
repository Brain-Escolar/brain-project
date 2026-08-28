"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Paper,
  TextField,
  Typography,
  Checkbox,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import BlockIcon from "@mui/icons-material/Block";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { RoutesEnum } from "@/enums";
import { useAlunos } from "@/hooks/useAlunos";
import { useTurmas } from "@/hooks/useTurmas";
import { turmaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export default function GerenciarAlunosTurmaPage() {
  const params = useParams<{ turmaId: string }>();
  const turmaId = params.turmaId;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { turmas, loading: loadingTurmas } = useTurmas();
  const { alunos, loading: loadingAlunos } = useAlunos();

  const [busca, setBusca] = useState("");
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [modalAdicionar, setModalAdicionar] = useState(false);
  const [alunoRemover, setAlunoRemover] = useState<{ id: number; nome: string } | null>(null);

  const turma = useMemo(() => turmas.find((t) => String(t.id) === turmaId), [turmas, turmaId]);

  const roster = useMemo(
    () => (turma ? alunos.filter((a) => a.turmaId === turma.id) : []),
    [alunos, turma],
  );

  const candidatos = useMemo(() => {
    if (!turma) return [];
    const q = busca.trim().toLowerCase();
    return alunos.filter(
      (a) =>
        !a.turmaId &&
        a.serieId === turma.serieId &&
        a.unidadeId === turma.unidadeId &&
        (!q || a.nome.toLowerCase().includes(q) || (a.matricula ?? "").toLowerCase().includes(q)),
    );
  }, [alunos, turma, busca]);

  const vagas = turma?.vagas ?? 0;
  const ocupadas = turma?.ocupadas ?? 0;
  const restantes = Math.max(0, vagas - ocupadas);
  const lotada = vagas > 0 && ocupadas >= vagas;
  const vagaExcedida = (n: number) => ocupadas + n > vagas;

  const vincularMutation = useMutation({
    mutationFn: () => turmaApi.vincularAlunos({ turmaId: turmaId!, alunoIds: selecionados }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.turmas.lists() });
      toast.success("Aluno(s) enturmado(s) com sucesso!");
      setSelecionados([]);
      setModalAdicionar(false);
    },
    onError: () => {
      toast.error("Erro ao enturmar aluno(s). Tente novamente.");
    },
  });

  const desvincularMutation = useMutation({
    mutationFn: (alunoId: number) => turmaApi.desvincularAluno(turmaId!, String(alunoId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.turmas.lists() });
      toast.success("Aluno removido da turma.");
      setAlunoRemover(null);
    },
    onError: () => {
      toast.error("Erro ao remover aluno da turma. Tente novamente.");
    },
  });

  function toggleSelecionado(id: number) {
    setSelecionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const loading = loadingTurmas || loadingAlunos;

  return (
    <PageScaffold>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push(RoutesEnum.SECRETARIA_ENTURMACAO)}
        sx={{ mb: 2 }}
      >
        Voltar para Enturmação
      </Button>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : !turma ? (
        <Alert severity="warning">Turma não encontrada.</Alert>
      ) : (
        <>
          <Paper sx={{ p: 3, mb: 3, boxShadow: 1 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "center" }}>
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <Typography variant="h6" fontWeight={700}>
                    {turma.nome}
                  </Typography>
                  {lotada && <Chip size="small" label="Lotada" color="error" variant="outlined" />}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {turma.serie} · {turma.unidade} · {turma.turno} · {turma.sala ?? "—"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 4 }}>
                <Stat label="Vagas" value={vagas} />
                <Stat label="Ocupadas" value={ocupadas} />
                <Stat label="Restantes" value={restantes} color="primary.main" />
              </Box>
            </Box>
          </Paper>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.15fr 1fr" }, gap: 3 }}>
            {/* Alunos na turma */}
            <Paper sx={{ boxShadow: 1, overflow: "hidden" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2.5,
                  py: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Alunos na turma
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: "monospace" }} color="text.secondary">
                  {roster.length} / {vagas}
                </Typography>
              </Box>
              {roster.length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="body2" fontWeight={600}>
                    Nenhum aluno nesta turma ainda
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Use o painel ao lado para adicionar alunos matriculados.
                  </Typography>
                </Box>
              ) : (
                <List sx={{ maxHeight: 520, overflowY: "auto", py: 0 }}>
                  {roster.map((aluno) => (
                    <ListItem
                      key={aluno.id}
                      divider
                      secondaryAction={
                        <Button
                          size="small"
                          color="error"
                          startIcon={<PersonRemoveIcon fontSize="small" />}
                          onClick={() => setAlunoRemover({ id: aluno.id, nome: aluno.nome })}
                        >
                          Remover
                        </Button>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ width: 30, height: 30, fontSize: 11 }}>{iniciais(aluno.nome)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={aluno.nome}
                        secondary={aluno.matricula}
                        slotProps={{
                          primary: { variant: "body2", fontWeight: 500 },
                          secondary: { sx: { fontFamily: "monospace", fontSize: 11 } },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>

            {/* Adicionar alunos */}
            <Paper sx={{ boxShadow: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Adicionar alunos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Somente alunos matriculados de {turma.serie} · {turma.unidade} sem turma.
                </Typography>
              </Box>

              {lotada ? (
                <Box sx={{ p: 4, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                  <BlockIcon color="error" sx={{ fontSize: 34 }} />
                  <Typography variant="body2" fontWeight={600}>
                    Turma lotada
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 280 }}>
                    Remova um aluno no painel ao lado para liberar vaga antes de adicionar alguém.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ px: 2.5, pt: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Buscar por nome ou matrícula"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
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
                  </Box>
                  {candidatos.length === 0 ? (
                    <Box sx={{ p: 3.5, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhum aluno matriculado sem turma para esta série e unidade.
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ flex: 1, maxHeight: 380, overflowY: "auto", py: 0, mt: 1 }}>
                      {candidatos.map((c) => {
                        const checked = selecionados.includes(c.id);
                        const disabled = !checked && vagaExcedida(selecionados.length + 1);
                        return (
                          <ListItem key={c.id} divider disablePadding>
                            <Box
                              component="button"
                              onClick={() => !disabled && toggleSelecionado(c.id)}
                              disabled={disabled}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                width: "100%",
                                p: 1.25,
                                pl: 2,
                                border: "none",
                                background: checked ? "action.selected" : "none",
                                cursor: disabled ? "not-allowed" : "pointer",
                                opacity: disabled ? 0.5 : 1,
                                textAlign: "left",
                                font: "inherit",
                              }}
                            >
                              <Checkbox checked={checked} disabled={disabled} size="small" sx={{ p: 0 }} />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={500} noWrap>
                                  {c.nome}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontFamily: "monospace", display: "block" }}
                                >
                                  {c.matricula}
                                </Typography>
                              </Box>
                              <Chip size="small" label="Sem turma" color="warning" variant="outlined" />
                            </Box>
                          </ListItem>
                        );
                      })}
                    </List>
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1.5,
                      px: 2.5,
                      py: 2,
                      borderTop: "1px solid",
                      borderColor: "divider",
                      bgcolor: "action.hover",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {selecionados.length === 0
                        ? "Nenhum aluno selecionado"
                        : `${selecionados.length} aluno${selecionados.length === 1 ? "" : "s"} selecionado${
                            selecionados.length === 1 ? "" : "s"
                          }`}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<GroupAddIcon fontSize="small" />}
                      disabled={selecionados.length === 0}
                      onClick={() => setModalAdicionar(true)}
                    >
                      Adicionar à turma
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          </Box>
        </>
      )}

      {/* Modal confirmar enturmação */}
      <Dialog open={modalAdicionar} onClose={() => setModalAdicionar(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar enturmação</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Adicionar à <strong>{turma?.nome}</strong>.
          </DialogContentText>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {alunos
              .filter((a) => selecionados.includes(a.id))
              .map((a) => (
                <Box
                  key={a.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1.5,
                  }}
                >
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {a.nome}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: "monospace" }} color="text.secondary">
                    {a.matricula}
                  </Typography>
                </Box>
              ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalAdicionar(false)} disabled={vincularMutation.isPending}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => vincularMutation.mutate()}
            disabled={vincularMutation.isPending}
          >
            {vincularMutation.isPending ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal remover da turma */}
      <Dialog open={!!alunoRemover} onClose={() => setAlunoRemover(null)}>
        <DialogTitle>Remover da turma</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Remover <strong>{alunoRemover?.nome}</strong> desta turma? O aluno continua matriculado, apenas
            fica sem turma.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlunoRemover(null)} disabled={desvincularMutation.isPending}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => alunoRemover && desvincularMutation.mutate(alunoRemover.id)}
            disabled={desvincularMutation.isPending}
          >
            {desvincularMutation.isPending ? "Removendo..." : "Remover"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageScaffold>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ fontFamily: "monospace", fontWeight: 600, color }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: 0.5, color: "text.secondary" }}>
        {label}
      </Typography>
    </Box>
  );
}
