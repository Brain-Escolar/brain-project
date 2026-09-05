"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CallIcon from "@mui/icons-material/Call";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import SegmentedControl from "@/components/segmentedControl/segmentedControl";
import { useAuth } from "@/hooks/useAuth";
import { useCrmProcessos } from "@/hooks/useCrmProcessos";
import { useCrmEstagios } from "@/hooks/useCrmEstagios";
import { useCrmEquipe } from "@/hooks/useCrmEquipe";
import { useCrmRelatorios } from "@/hooks/useCrmRelatorios";
import { useCrmMutations } from "@/hooks/useCrmMutations";
import { RoutesEnum } from "@/enums";
import { ListagemProcessoCrmResponse, TipoProcessoCrm } from "@/services/domains/crm";
import NovoLeadDialog from "./_components/NovoLeadDialog";
import RegistrarInteracaoDialog from "./_components/RegistrarInteracaoDialog";

type TabValue = "dia" | "funil" | "fila" | "relatorios" | "estagios";
type Urgencia = "atrasado" | "hoje" | "futuro" | null;

const ANO_ATUAL = new Date().getFullYear();

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

function formatarDataHora(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function urgenciaProxima(iso?: string): Urgencia {
  if (!iso) return null;
  const alvo = new Date(iso);
  const agora = new Date();
  if (alvo.toDateString() === agora.toDateString()) return "hoje";
  return alvo.getTime() < agora.getTime() ? "atrasado" : "futuro";
}

function urgenciaCor(urgencia: Urgencia): "error" | "primary" | "default" {
  if (urgencia === "atrasado") return "error";
  if (urgencia === "hoje") return "primary";
  return "default";
}

function KpiCard({ label, valor, nota }: { label: string; valor: string | number; nota?: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={600}>
        {valor}
      </Typography>
      {nota && (
        <Typography variant="caption" color="text.secondary">
          {nota}
        </Typography>
      )}
    </Paper>
  );
}

export default function CrmPage() {
  const router = useRouter();
  const { user } = useAuth();
  const meuId = user?.dadosPessoaisId;

  const [tab, setTab] = useState<TabValue>("dia");
  const [modalNovoLead, setModalNovoLead] = useState(false);
  const [modalDistribuir, setModalDistribuir] = useState(false);
  const [processoInteracao, setProcessoInteracao] = useState<ListagemProcessoCrmResponse | null>(
    null,
  );

  const [escopoFunil, setEscopoFunil] = useState<"meus" | "equipe">("meus");
  const [tipoFunil, setTipoFunil] = useState<"Todos" | TipoProcessoCrm>("Todos");
  const [novoEstagio, setNovoEstagio] = useState<{ nome: string; slaDias: string } | null>(null);
  const [editandoEstagio, setEditandoEstagio] = useState<{
    id: number;
    nome: string;
    slaDias: string;
  } | null>(null);

  const { processos, loading: loadingProcessos } = useCrmProcessos({ status: "ATIVO" });
  const { estagios } = useCrmEstagios();
  const { equipe } = useCrmEquipe();
  const { relatorio } = useCrmRelatorios(ANO_ATUAL);
  const { distribuirFila, atribuirAMim, criarEstagio, atualizarEstagio, moverEstagio } =
    useCrmMutations();

  const meus = useMemo(
    () => processos.filter((p) => p.funcionarioId === meuId),
    [processos, meuId],
  );
  const semDono = useMemo(() => processos.filter((p) => !p.funcionarioId), [processos]);
  const followUps = useMemo(
    () => meus.filter((p) => ["hoje", "atrasado"].includes(urgenciaProxima(p.proximaAcao) ?? "")),
    [meus],
  );
  const atrasados = useMemo(() => meus.filter((p) => p.diasNoEstagio >= 5), [meus]);

  const estagiosOrdenados = useMemo(
    () => [...estagios].sort((a, b) => a.ordem - b.ordem),
    [estagios],
  );
  const estagiosFunil = useMemo(() => estagiosOrdenados.slice(0, -1), [estagiosOrdenados]);

  const funilBase = useMemo(
    () =>
      processos.filter(
        (p) =>
          (escopoFunil === "meus" ? p.funcionarioId === meuId : true) &&
          (tipoFunil === "Todos" || p.tipo === tipoFunil),
      ),
    [processos, escopoFunil, tipoFunil, meuId],
  );

  const equipeOrdenada = useMemo(
    () => [...equipe].sort((a, b) => a.quantidadeAtiva - b.quantidadeAtiva),
    [equipe],
  );

  function abrirDetalhe(id: number) {
    router.push(`${RoutesEnum.SECRETARIA_CRM}/${id}`);
  }

  async function confirmarDistribuir() {
    await distribuirFila.mutateAsync();
    setModalDistribuir(false);
  }

  return (
    <PageScaffold
      title="CRM de matrículas"
      description="Funil de captação e rematrícula da secretaria."
      actions={
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setModalNovoLead(true)}
        >
          Novo lead
        </Button>
      }
    >
      <Box sx={{ mb: 2 }}>
        <SegmentedControl
          ariaLabel="Seção do CRM"
          value={tab}
          onChange={setTab}
          options={[
            { value: "dia", label: "Meu dia" },
            { value: "funil", label: "Funil" },
            { value: "fila", label: `Fila · ${semDono.length}` },
            { value: "relatorios", label: "Relatórios" },
            { value: "estagios", label: "Estágios" },
          ]}
        />
      </Box>

      {loadingProcessos ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {tab === "dia" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
                  gap: 2,
                }}
              >
                <KpiCard label="Minha carteira" valor={meus.length} nota="processos ativos" />
                <KpiCard
                  label="Follow-ups hoje"
                  valor={followUps.length}
                  nota="contatos programados"
                />
                <KpiCard
                  label="Fora do prazo"
                  valor={meus.filter((p) => urgenciaProxima(p.proximaAcao) === "atrasado").length}
                  nota="precisam de contato agora"
                />
                <KpiCard
                  label="Matrículas no ano"
                  valor={relatorio?.totalMatriculados ?? "—"}
                  nota={`ciclo ${ANO_ATUAL}`}
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
                  gap: 2.5,
                }}
              >
                <Paper variant="outlined" sx={{ p: 2.5 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
                    Follow-ups de hoje
                  </Typography>
                  {followUps.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Nenhum follow-up pendente na sua carteira.
                    </Typography>
                  )}
                  {followUps.map((p) => (
                    <Box
                      key={p.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        py: 1.2,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Avatar sx={{ width: 36, height: 36, fontSize: 13 }}>
                        {iniciais(p.alunoNome)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {p.alunoNome}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.serieNome} · {p.estagioNome}
                          {p.subestagio ? ` · ${p.subestagio}` : ""}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={formatarDataHora(p.proximaAcao)}
                        color={urgenciaCor(urgenciaProxima(p.proximaAcao))}
                      />
                      <Button
                        size="small"
                        startIcon={<CallIcon fontSize="small" />}
                        onClick={() => setProcessoInteracao(p)}
                      >
                        Ligar
                      </Button>
                      <Button size="small" onClick={() => abrirDetalhe(p.id)}>
                        Abrir
                      </Button>
                    </Box>
                  ))}
                </Paper>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Paper variant="outlined" sx={{ p: 2.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Fila sem responsável
                      </Typography>
                      <Button size="small" onClick={() => setTab("fila")}>
                        Ver fila
                      </Button>
                    </Box>
                    {semDono.slice(0, 3).map((p) => (
                      <Box
                        key={p.id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 0.8,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {p.alunoNome}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {p.origemNome}
                          </Typography>
                        </Box>
                        <Chip size="small" label={`${p.diasNoEstagio} d`} />
                      </Box>
                    ))}
                    {semDono.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Fila zerada.
                      </Typography>
                    )}
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2.5 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                      Atrasados na minha carteira
                    </Typography>
                    {atrasados.map((p) => (
                      <Box
                        key={p.id}
                        onClick={() => abrirDetalhe(p.id)}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 0.8,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          cursor: "pointer",
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {p.alunoNome}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {p.estagioNome}
                          </Typography>
                        </Box>
                        <Chip size="small" color="warning" label={`${p.diasNoEstagio} d`} />
                      </Box>
                    ))}
                    {atrasados.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Nenhum processo atrasado.
                      </Typography>
                    )}
                  </Paper>
                </Box>
              </Box>
            </Box>
          )}

          {tab === "funil" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
                <SegmentedControl
                  ariaLabel="Escopo do funil"
                  value={escopoFunil}
                  onChange={setEscopoFunil}
                  options={[
                    { value: "meus", label: "Meus leads" },
                    { value: "equipe", label: "Toda a equipe" },
                  ]}
                />
                {(["Todos", "NOVA", "REMATRICULA"] as const).map((t) => (
                  <Chip
                    key={t}
                    label={t === "NOVA" ? "Novas" : t === "REMATRICULA" ? "Rematrícula" : "Todos"}
                    color={tipoFunil === t ? "primary" : "default"}
                    sx={{
                      ...(tipoFunil === t && {
                        color: "white",
                        "& .MuiChip-label": { color: "white" },
                      }),
                    }}
                    onClick={() => setTipoFunil(t)}
                  />
                ))}
                <Box sx={{ flex: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  {funilBase.length} processos ativos
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1 }}>
                {estagiosFunil.map((estagio) => {
                  const cards = funilBase.filter((p) => p.estagioId === estagio.id);
                  return (
                    <Box key={estagio.id} sx={{ width: 260, minWidth: 260 }}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {estagio.nome} · {cards.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          SLA {estagio.slaDias ? `${estagio.slaDias} d` : "—"}
                        </Typography>
                      </Box>
                      <Paper
                        variant="outlined"
                        sx={{
                          bgcolor: "action.hover",
                          p: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          minHeight: 120,
                        }}
                      >
                        {cards.map((p) => (
                          <Paper
                            key={p.id}
                            onClick={() => abrirDetalhe(p.id)}
                            sx={{
                              p: 1.3,
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              gap: 0.5,
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                              <Chip
                                size="small"
                                label={p.tipo === "NOVA" ? "Nova" : "Rematrícula"}
                                color={p.tipo === "NOVA" ? "primary" : "default"}
                              />
                              <Chip size="small" label={`${p.diasNoEstagio} d`} />
                            </Box>
                            <Typography variant="body2" fontWeight={600}>
                              {p.alunoNome}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {p.serieNome} · {p.origemNome}
                            </Typography>
                            {p.subestagio && (
                              <Chip
                                size="small"
                                label={p.subestagio}
                                sx={{ alignSelf: "flex-start" }}
                              />
                            )}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                pt: 0.8,
                                mt: 0.4,
                                borderTop: "1px solid",
                                borderColor: "divider",
                              }}
                            >
                              <Avatar sx={{ width: 22, height: 22, fontSize: 9 }}>
                                {p.funcionarioNome ? iniciais(p.funcionarioNome) : "—"}
                              </Avatar>
                              <Typography variant="caption" color="text.secondary">
                                {formatarDataHora(p.proximaAcao)}
                              </Typography>
                            </Box>
                          </Paper>
                        ))}
                        {cards.length === 0 && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textAlign: "center", py: 2 }}
                          >
                            Nenhum processo neste estágio
                          </Typography>
                        )}
                      </Paper>
                    </Box>
                  );
                })}
              </Box>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Paper
                  variant="outlined"
                  sx={{
                    flex: 1,
                    minWidth: 240,
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Matriculados no ciclo
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {relatorio?.totalMatriculados ?? "—"}
                  </Typography>
                </Paper>
                <Paper
                  variant="outlined"
                  sx={{
                    flex: 1,
                    minWidth: 240,
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Perdidos / desistiram
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {relatorio?.totalPerdidos ?? "—"}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}

          {tab === "fila" && (
            <Box
              sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: 2.5 }}
            >
              <TableContainer component={Paper} variant="outlined">
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Leads sem responsável · {semDono.length}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<RotateRightIcon fontSize="small" />}
                    onClick={() => setModalDistribuir(true)}
                    disabled={semDono.length === 0}
                  >
                    Distribuir automaticamente
                  </Button>
                </Box>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Lead</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Origem</TableCell>
                      <TableCell>Espera</TableCell>
                      <TableCell align="right">Ação</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {semDono.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: 11 }}>
                              {iniciais(p.alunoNome)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {p.alunoNome}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {p.serieNome} · resp. {p.responsavelNome ?? "—"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{p.tipo === "NOVA" ? "Nova" : "Rematrícula"}</TableCell>
                        <TableCell>{p.origemNome}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={p.diasNoEstagio >= 3 ? "warning" : "default"}
                            label={`${p.diasNoEstagio} d`}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => atribuirAMim.mutate(p.id)}
                            disabled={atribuirAMim.isPending}
                          >
                            Atribuir a mim
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {semDono.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ p: 3, textAlign: "center" }}
                  >
                    Fila zerada — todos os leads têm responsável.
                  </Typography>
                )}
              </TableContainer>

              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                  Carga da equipe
                </Typography>
                {equipeOrdenada.map((e, idx) => (
                  <Box
                    key={e.funcionarioId}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 1,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 10 }}>
                        {iniciais(e.nome)}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {e.nome}
                      </Typography>
                      {idx === 0 && (
                        <Chip size="small" color="primary" label="Próximo" variant="outlined" />
                      )}
                    </Box>
                    <Chip size="small" label={e.quantidadeAtiva} />
                  </Box>
                ))}
                {equipeOrdenada.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum atendente cadastrado.
                  </Typography>
                )}
              </Paper>
            </Box>
          )}

          {tab === "relatorios" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
                  gap: 2,
                }}
              >
                <KpiCard
                  label="Conversão do ciclo"
                  valor={`${(relatorio?.conversaoPercentual ?? 0).toFixed(1)}%`}
                  nota={`${relatorio?.totalMatriculados ?? 0} matrículas em ${relatorio?.totalLeads ?? 0} leads`}
                />
                <KpiCard
                  label="Tempo médio até matrícula"
                  valor={
                    relatorio?.tempoMedioAteMatriculaDias != null
                      ? `${relatorio.tempoMedioAteMatriculaDias.toFixed(0)} d`
                      : "—"
                  }
                />
                <KpiCard
                  label="Tempo até 1º contato"
                  valor={
                    relatorio?.tempoMedioAte1ContatoDias != null
                      ? `${relatorio.tempoMedioAte1ContatoDias.toFixed(1)} d`
                      : "—"
                  }
                />
                <KpiCard label="Leads perdidos" valor={relatorio?.totalPerdidos ?? 0} />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
                  gap: 2.5,
                }}
              >
                <Paper variant="outlined" sx={{ p: 2.5 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
                    Conversão por estágio
                  </Typography>
                  {(relatorio?.funil ?? []).map((f) => {
                    const max = Math.max(...(relatorio?.funil ?? []).map((x) => x.quantidade), 1);
                    return (
                      <Box
                        key={f.estagioNome}
                        sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
                      >
                        <Typography variant="caption" sx={{ minWidth: 140 }} color="text.secondary">
                          {f.estagioNome}
                        </Typography>
                        <Box
                          sx={{
                            flex: 1,
                            height: 20,
                            bgcolor: "action.hover",
                            borderRadius: 1,
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              height: "100%",
                              width: `${(f.quantidade / max) * 100}%`,
                              bgcolor: "primary.main",
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ minWidth: 28, textAlign: "right" }}>
                          {f.quantidade}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ minWidth: 60, textAlign: "right" }}
                        >
                          {f.tempoMedioDias != null ? `${f.tempoMedioDias.toFixed(1)} d` : "—"}
                        </Typography>
                      </Box>
                    );
                  })}
                </Paper>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Paper variant="outlined" sx={{ p: 2.5 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                      Origem dos leads
                    </Typography>
                    {(relatorio?.origens ?? []).map((o) => (
                      <Box
                        key={o.origemNome}
                        sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {o.origemNome}
                        </Typography>
                        <Typography variant="caption">
                          {o.quantidade} · {o.conversaoPercentual.toFixed(0)}%
                        </Typography>
                      </Box>
                    ))}
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2.5 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                      Motivos de perda
                    </Typography>
                    {(relatorio?.motivosPerda ?? []).map((m) => (
                      <Box
                        key={m.motivo}
                        sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}
                      >
                        <Typography variant="body2">{m.motivo}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {m.quantidade} · {m.percentual.toFixed(0)}%
                        </Typography>
                      </Box>
                    ))}
                    {(relatorio?.motivosPerda ?? []).length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Nenhum motivo de perda registrado ainda.
                      </Typography>
                    )}
                  </Paper>
                </Box>
              </Box>
            </Box>
          )}

          {tab === "estagios" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TableContainer component={Paper} variant="outlined">
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Estágios do funil
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon fontSize="small" />}
                    onClick={() => setNovoEstagio({ nome: "", slaDias: "" })}
                  >
                    Adicionar estágio
                  </Button>
                </Box>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ordem</TableCell>
                      <TableCell>Estágio</TableCell>
                      <TableCell>SLA</TableCell>
                      <TableCell>Processos</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {estagiosOrdenados.map((e, idx) => (
                      <TableRow key={e.id} hover>
                        <TableCell>{e.ordem}</TableCell>
                        <TableCell>{e.nome}</TableCell>
                        <TableCell>{e.slaDias ? `${e.slaDias} d` : "—"}</TableCell>
                        <TableCell>
                          {processos.filter((p) => p.estagioId === e.id).length}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() =>
                              setEditandoEstagio({
                                id: e.id,
                                nome: e.nome,
                                slaDias: e.slaDias ? String(e.slaDias) : "",
                              })
                            }
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            disabled={idx === 0}
                            onClick={() => moverEstagio.mutate({ id: e.id, direcao: "CIMA" })}
                          >
                            <ArrowUpwardIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            disabled={idx === estagiosOrdenados.length - 1}
                            onClick={() => moverEstagio.mutate({ id: e.id, direcao: "BAIXO" })}
                          >
                            <ArrowDownwardIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </>
      )}

      <NovoLeadDialog open={modalNovoLead} onClose={() => setModalNovoLead(false)} />

      {processoInteracao && (
        <RegistrarInteracaoDialog
          open={!!processoInteracao}
          onClose={() => setProcessoInteracao(null)}
          processoId={processoInteracao.id}
          alunoNome={processoInteracao.alunoNome}
          responsavelNome={processoInteracao.responsavelNome}
          estagioAtualId={processoInteracao.estagioId}
          estagios={estagiosOrdenados}
        />
      )}

      <Dialog open={modalDistribuir} onClose={() => setModalDistribuir(false)}>
        <DialogTitle>Distribuir fila</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{semDono.length} leads</strong> sem responsável serão atribuídos por round-robin
            entre os atendentes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalDistribuir(false)}>Cancelar</Button>
          <Button
            variant="contained"
            startIcon={<RotateRightIcon />}
            onClick={confirmarDistribuir}
            disabled={distribuirFila.isPending}
          >
            Distribuir agora
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!novoEstagio} onClose={() => setNovoEstagio(null)}>
        <DialogTitle>Adicionar estágio</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1, minWidth: 320 }}
        >
          <TextField
            label="Nome"
            value={novoEstagio?.nome ?? ""}
            onChange={(e) => setNovoEstagio((s) => (s ? { ...s, nome: e.target.value } : s))}
          />
          <TextField
            label="SLA (dias)"
            type="number"
            value={novoEstagio?.slaDias ?? ""}
            onChange={(e) => setNovoEstagio((s) => (s ? { ...s, slaDias: e.target.value } : s))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNovoEstagio(null)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={!novoEstagio?.nome.trim()}
            onClick={async () => {
              if (!novoEstagio) return;
              await criarEstagio.mutateAsync({
                nome: novoEstagio.nome,
                ordem: estagiosOrdenados.length + 1,
                slaDias: novoEstagio.slaDias ? Number(novoEstagio.slaDias) : undefined,
              });
              setNovoEstagio(null);
            }}
          >
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editandoEstagio} onClose={() => setEditandoEstagio(null)}>
        <DialogTitle>Editar estágio</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1, minWidth: 320 }}
        >
          <TextField
            label="Nome"
            value={editandoEstagio?.nome ?? ""}
            onChange={(e) => setEditandoEstagio((s) => (s ? { ...s, nome: e.target.value } : s))}
          />
          <TextField
            label="SLA (dias)"
            type="number"
            value={editandoEstagio?.slaDias ?? ""}
            onChange={(e) => setEditandoEstagio((s) => (s ? { ...s, slaDias: e.target.value } : s))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditandoEstagio(null)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!editandoEstagio) return;
              await atualizarEstagio.mutateAsync({
                id: editandoEstagio.id,
                dados: {
                  nome: editandoEstagio.nome,
                  slaDias: editandoEstagio.slaDias ? Number(editandoEstagio.slaDias) : undefined,
                },
              });
              setEditandoEstagio(null);
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </PageScaffold>
  );
}
