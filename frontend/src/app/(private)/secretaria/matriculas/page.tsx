"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Alert,
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
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import SegmentedControl from "@/components/segmentedControl/segmentedControl";
import AlunosView, { ColunaAluno } from "@/components/alunosView/AlunosView";
import { RoutesEnum } from "@/enums";
import { useLeads } from "@/hooks/useLeads";
import { useAlunos } from "@/hooks/useAlunos";
import { useDesmatriculados } from "@/hooks/useDesmatriculados";
import { useTurmas } from "@/hooks/useTurmas";
import { useSeries } from "@/hooks/useSeries";
import { useUnidades } from "@/hooks/useUnidades";
import { useAlunoMatriculaMutations } from "@/hooks/useAlunoMatriculaMutations";
import { AlunoDetalheResponse, AlunoListaResponse } from "@/services/domains/aluno/response";
import { TurmaListaResponse } from "@/services/domains/turma/response";
import { alunoApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { iniciais } from "@/utils/utils";

type TabValue = "leads" | "matriculados" | "desmatriculados";
type ModalType = "matricular" | "matriculado" | "vincular" | "desmatricular" | "rematricular" | null;

// Larguras fixas e iguais nas 3 tabelas (leads/matriculados/desmatriculados) para que a
// coluna Aluno e a coluna Ações não mudem de posição ao trocar de aba — a de Matriculados
// tem uma Ação a mais (Vincular + Ver detalhe + Desmatricular) que as outras duas.
const COL_ALUNO_WIDTH = 260;
const COL_ACOES_WIDTH = 320;

function formatarData(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default function MatriculasPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<TabValue>("leads");
  const [busca, setBusca] = useState("");
  const [filtroSerie, setFiltroSerie] = useState("Todas");
  const [filtroUnidade, setFiltroUnidade] = useState("Todas");

  const { leads, loading: loadingLeads } = useLeads();
  const { alunos: matriculados, loading: loadingMatriculados } = useAlunos();
  const { desmatriculados, loading: loadingDesmatriculados } = useDesmatriculados();
  const { turmas, loading: loadingTurmas } = useTurmas();
  const { series } = useSeries();
  const { unidades } = useUnidades();

  const [modal, setModal] = useState<ModalType>(null);
  const [ctxAluno, setCtxAluno] = useState<AlunoListaResponse | null>(null);
  const [credenciais, setCredenciais] = useState<AlunoDetalheResponse | null>(null);
  const [turmaSelecionada, setTurmaSelecionada] = useState<number | null>(null);
  const [motivo, setMotivo] = useState("");

  const { matricular, desmatricular, rematricular } = useAlunoMatriculaMutations(
    String(ctxAluno?.id ?? ""),
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.matriculados() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.turmas.lists() });
      toast.success("Turma vinculada com sucesso!");
      fecharModal();
    },
    onError: () => {
      toast.error("Erro ao vincular turma. Tente novamente.");
    },
  });

  function fecharModal() {
    setModal(null);
    setCtxAluno(null);
    setCredenciais(null);
    setTurmaSelecionada(null);
    setMotivo("");
  }

  function abrirMatricular(aluno: AlunoListaResponse) {
    setCtxAluno(aluno);
    setModal("matricular");
  }

  function abrirVincular(aluno: AlunoListaResponse) {
    setCtxAluno(aluno);
    setTurmaSelecionada(aluno.turmaId ?? null);
    setModal("vincular");
  }

  function abrirDesmatricular(aluno: AlunoListaResponse) {
    setCtxAluno(aluno);
    setMotivo("");
    setModal("desmatricular");
  }

  function abrirRematricular(aluno: AlunoListaResponse) {
    setCtxAluno(aluno);
    setModal("rematricular");
  }

  function verDetalhe(id: number) {
    router.push(`${RoutesEnum.ALUNO_DETALHE}/${id}`);
  }

  async function confirmarMatricular() {
    const resultado = await matricular.mutateAsync();
    setCredenciais(resultado);
    setModal("matriculado");
  }

  function confirmarVincular() {
    if (turmaSelecionada == null) return;
    const turma = turmas.find((t) => t.id === turmaSelecionada);
    if (!turma) return;
    vincularMutation.mutate(turma);
  }

  async function confirmarDesmatricular() {
    await desmatricular.mutateAsync(motivo);
    fecharModal();
  }

  async function confirmarRematricular() {
    await rematricular.mutateAsync();
    fecharModal();
  }

  const filtrar = (item: AlunoListaResponse) => {
    const q = busca.trim().toLowerCase();
    const matchBusca =
      !q ||
      item.nome.toLowerCase().includes(q) ||
      (item.cpf ?? "").includes(q) ||
      (item.matricula ?? "").toLowerCase().includes(q);
    const matchSerie = filtroSerie === "Todas" || item.serie === filtroSerie;
    const matchUnidade = filtroUnidade === "Todas" || item.unidade === filtroUnidade;
    return matchBusca && matchSerie && matchUnidade;
  };

  const leadsFiltrados = useMemo(
    () => leads.filter(filtrar),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [leads, busca, filtroSerie, filtroUnidade],
  );
  const matriculadosFiltrados = useMemo(
    () => matriculados.filter(filtrar),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [matriculados, busca, filtroSerie, filtroUnidade],
  );
  const desmatriculadosFiltrados = useMemo(
    () => desmatriculados.filter(filtrar),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [desmatriculados, busca, filtroSerie, filtroUnidade],
  );

  const loading = loadingLeads || loadingMatriculados || loadingDesmatriculados;

  return (
    <PageScaffold
      title="Matrículas"
      description="Acompanhe o funil de leads, matricule alunos e vincule turmas."
      actions={
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => router.push(RoutesEnum.ALUNO_CADASTRO)}
        >
          Cadastrar aluno
        </Button>
      }
    >
      <Box sx={{ mb: 2 }}>
        <SegmentedControl
          ariaLabel="Filtrar por situação da matrícula"
          value={tab}
          onChange={setTab}
          options={[
            { value: "leads", label: `Leads · ${leads.length}` },
            { value: "matriculados", label: `Matriculados · ${matriculados.length}` },
            { value: "desmatriculados", label: `Desmatriculados · ${desmatriculados.length}` },
          ]}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mb: 2 }}>
        <TextField
          size="small"
          placeholder="Buscar por nome, CPF ou matrícula"
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
        <Select size="small" value={filtroUnidade} onChange={(e) => setFiltroUnidade(e.target.value)}>
          <MenuItem value="Todas">Todas as unidades</MenuItem>
          {unidades.map((u) => (
            <MenuItem key={u.id} value={u.nome}>
              {u.nome}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {tab === "leads" && (
        <LeadsTable
          leads={leadsFiltrados}
          loading={loading}
          onEditar={(id) => router.push(`${RoutesEnum.ALUNO_CADASTRO}?id=${id}`)}
          onMatricular={abrirMatricular}
        />
      )}
      {tab === "matriculados" && (
        <MatriculadosTable
          alunos={matriculadosFiltrados}
          loading={loading}
          onVerDetalhe={verDetalhe}
          onVincular={abrirVincular}
          onDesmatricular={abrirDesmatricular}
        />
      )}
      {tab === "desmatriculados" && (
        <DesmatriculadosTable
          alunos={desmatriculadosFiltrados}
          loading={loading}
          onVerDetalhe={verDetalhe}
          onRematricular={abrirRematricular}
        />
      )}

      {/* Modal Matricular (confirmação) */}
      <Dialog open={modal === "matricular"} onClose={fecharModal}>
        <DialogTitle>Matricular aluno</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Confirma a matrícula de <strong>{ctxAluno?.nome}</strong>? A matrícula e as
            credenciais de acesso serão geradas automaticamente.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModal} disabled={matricular.isPending}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={confirmarMatricular}
            disabled={matricular.isPending}
            startIcon={matricular.isPending ? <CircularProgress size={16} /> : <HowToRegIcon />}
          >
            {matricular.isPending ? "Matriculando..." : "Matricular"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal credenciais geradas */}
      <Dialog open={modal === "matriculado"} onClose={fecharModal} maxWidth="xs" fullWidth>
        <DialogTitle>Matrícula gerada</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            {ctxAluno?.nome} foi matriculado(a) com sucesso!
          </Alert>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body2">
              <strong>Matrícula:</strong> {credenciais?.matricula}
            </Typography>
            <Typography variant="body2">
              <strong>E-mail escolar:</strong> {credenciais?.emailEscolar}
            </Typography>
            <Typography variant="body2">
              <strong>Senha inicial:</strong> {ctxAluno?.cpf}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModal}>Fechar</Button>
          <Button
            variant="contained"
            startIcon={<SwapHorizIcon />}
            onClick={() => {
              setTurmaSelecionada(null);
              setModal("vincular");
            }}
          >
            Vincular turma agora
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Vincular turma */}
      <Dialog open={modal === "vincular"} onClose={fecharModal} maxWidth="sm" fullWidth>
        <DialogTitle>{ctxAluno?.turmaId ? "Alterar turma" : "Vincular turma"}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Selecione a turma de <strong>{ctxAluno?.nome}</strong>.
          </DialogContentText>
          {loadingTurmas ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <RadioGroup
              value={turmaSelecionada ?? ""}
              onChange={(e) => setTurmaSelecionada(Number(e.target.value))}
            >
              {turmas.map((t) => {
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
                          {isAtual ? " (atual)" : ""} — {t.serie} · {t.unidade} · {t.turno}
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
          <Button onClick={fecharModal} disabled={vincularMutation.isPending}>
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

      {/* Modal Desmatricular */}
      <Dialog open={modal === "desmatricular"} onClose={fecharModal} maxWidth="xs" fullWidth>
        <DialogTitle>Desmatricular aluno</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Confirma a desmatrícula de <strong>{ctxAluno?.nome}</strong>?
          </DialogContentText>
          <TextField
            label="Motivo"
            fullWidth
            multiline
            minRows={2}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModal} disabled={desmatricular.isPending}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmarDesmatricular}
            disabled={!motivo.trim() || desmatricular.isPending}
            startIcon={desmatricular.isPending ? <CircularProgress size={16} /> : <PersonOffIcon />}
          >
            {desmatricular.isPending ? "Desmatriculando..." : "Desmatricular"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Rematricular */}
      <Dialog open={modal === "rematricular"} onClose={fecharModal}>
        <DialogTitle>Rematricular aluno</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Confirma a rematrícula de <strong>{ctxAluno?.nome}</strong>? A matrícula e as
            credenciais de acesso anteriores serão reativadas.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModal} disabled={rematricular.isPending}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={confirmarRematricular} disabled={rematricular.isPending}>
            {rematricular.isPending ? "Rematriculando..." : "Rematricular"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageScaffold>
  );
}

/** Coluna "Aluno" comum às três abas, com um subtítulo opcional. */
function colunaAluno(subtitulo?: (aluno: AlunoListaResponse) => string): ColunaAluno {
  return {
    key: "nome",
    label: "Aluno",
    width: COL_ALUNO_WIDTH,
    render: (aluno) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
        <Avatar sx={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>
          {iniciais(aluno.nome)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {aluno.nome}
          </Typography>
          {subtitulo && (
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ fontFamily: "monospace", display: "block" }}
            >
              {subtitulo(aluno)}
            </Typography>
          )}
        </Box>
      </Box>
    ),
  };
}

const COLUNA_MATRICULA: ColunaAluno = {
  key: "matricula",
  label: "Matrícula",
  render: (aluno) => (
    <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
      {aluno.matricula}
    </Typography>
  ),
};

function LeadsTable({
  leads,
  loading,
  onEditar,
  onMatricular,
}: {
  leads: AlunoListaResponse[];
  loading: boolean;
  onEditar: (id: number) => void;
  onMatricular: (aluno: AlunoListaResponse) => void;
}) {
  return (
    <AlunosView
      alunos={leads}
      loading={loading}
      semFiltros
      larguraFixa
      // Leads ainda não têm detalhe para abrir — a linha não é clicável.
      onSelecionar={null}
      mensagemVazio="Nenhum lead encontrado."
      larguraAcoes={COL_ACOES_WIDTH}
      colunas={[
        colunaAluno(),
        {
          key: "cpf",
          label: "CPF",
          render: (lead) => (
            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
              {lead.cpf || "— sem CPF"}
            </Typography>
          ),
        },
        { key: "serie", label: "Série pretendida" },
        { key: "criadoEm", label: "Cadastrado em", render: (lead) => formatarData(lead.criadoEm) },
      ]}
      acoes={(lead) => (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button size="small" onClick={() => onEditar(lead.id)}>
            Editar cadastro
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<HowToRegIcon fontSize="small" />}
            disabled={!lead.cpf}
            title={!lead.cpf ? "Cadastro incompleto — falta CPF" : "Gerar matrícula e credenciais"}
            onClick={() => onMatricular(lead)}
          >
            Matricular
          </Button>
        </Box>
      )}
    />
  );
}

function MatriculadosTable({
  alunos,
  loading,
  onVerDetalhe,
  onVincular,
  onDesmatricular,
}: {
  alunos: AlunoListaResponse[];
  loading: boolean;
  onVerDetalhe: (id: number) => void;
  onVincular: (aluno: AlunoListaResponse) => void;
  onDesmatricular: (aluno: AlunoListaResponse) => void;
}) {
  return (
    <AlunosView
      alunos={alunos}
      loading={loading}
      semFiltros
      larguraFixa
      onSelecionar={(aluno) => onVerDetalhe(aluno.id)}
      mensagemVazio="Nenhum resultado para a busca atual."
      larguraAcoes={COL_ACOES_WIDTH}
      colunas={[
        colunaAluno((aluno) => aluno.cpf),
        COLUNA_MATRICULA,
        { key: "serie", label: "Série" },
        {
          key: "turma",
          label: "Turma",
          render: (aluno) => (aluno.turmaId ? aluno.turma : "— sem turma"),
        },
        {
          key: "situacao",
          label: "Situação",
          render: (aluno) => (
            <Chip
              size="small"
              label={aluno.turmaId ? "Matriculado" : "Matrícula incompleta"}
              color={aluno.turmaId ? "success" : "warning"}
              variant="outlined"
            />
          ),
        },
      ]}
      acoes={(aluno) => (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button size="small" onClick={() => onVincular(aluno)}>
            {aluno.turmaId ? "Alterar turma" : "Vincular turma"}
          </Button>
          <Button size="small" onClick={() => onVerDetalhe(aluno.id)}>
            Ver detalhe
          </Button>
          <IconButton
            size="small"
            color="error"
            title="Desmatricular"
            onClick={() => onDesmatricular(aluno)}
          >
            <PersonOffIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    />
  );
}

function DesmatriculadosTable({
  alunos,
  loading,
  onVerDetalhe,
  onRematricular,
}: {
  alunos: AlunoListaResponse[];
  loading: boolean;
  onVerDetalhe: (id: number) => void;
  onRematricular: (aluno: AlunoListaResponse) => void;
}) {
  return (
    <AlunosView
      alunos={alunos}
      loading={loading}
      semFiltros
      larguraFixa
      onSelecionar={(aluno) => onVerDetalhe(aluno.id)}
      mensagemVazio="Nenhum aluno desmatriculado."
      larguraAcoes={COL_ACOES_WIDTH}
      colunas={[
        colunaAluno(),
        COLUNA_MATRICULA,
        { key: "serie", label: "Série" },
        {
          key: "dataDesmatricula",
          label: "Desligado em",
          render: (aluno) => (
            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
              {formatarData(aluno.dataDesmatricula)}
            </Typography>
          ),
        },
        { key: "motivoDesmatricula", label: "Motivo" },
      ]}
      acoes={(aluno) => (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button size="small" onClick={() => onVerDetalhe(aluno.id)}>
            Ver detalhe
          </Button>
          <Button size="small" variant="outlined" onClick={() => onRematricular(aluno)}>
            Rematricular
          </Button>
        </Box>
      )}
    />
  );
}
