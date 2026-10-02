"use client";

import { useEffect, useState } from "react";
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
import DocumentacaoAlunoDialog from "@/components/documentacao/DocumentacaoAlunoDialog";
import SegmentedControl from "@/components/segmentedControl/segmentedControl";
import AlunosView, { ColunaAluno, PaginacaoServidor } from "@/components/alunosView/AlunosView";
import { RoutesEnum } from "@/enums";
import { useLeads } from "@/hooks/useLeads";
import { useAlunos } from "@/hooks/useAlunos";
import { useDesmatriculados } from "@/hooks/useDesmatriculados";
import { useTurmas } from "@/hooks/useTurmas";
import { useSeries } from "@/hooks/useSeries";
import { useUnidades } from "@/hooks/useUnidades";
import { useAlunoMatriculaMutations } from "@/hooks/useAlunoMatriculaMutations";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
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
  const [filtroSerie, setFiltroSerie] = useState<number | "Todas">("Todas");
  const [filtroUnidade, setFiltroUnidade] = useState<number | "Todas">("Todas");
  const buscaDebounced = useDebouncedValue(busca, 400);

  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [pageLeads, setPageLeads] = useState(0);
  const [pageMatriculados, setPageMatriculados] = useState(0);
  const [pageDesmatriculados, setPageDesmatriculados] = useState(0);

  useEffect(() => {
    setPageLeads(0);
    setPageMatriculados(0);
    setPageDesmatriculados(0);
  }, [buscaDebounced, filtroSerie, filtroUnidade]);

  const filtrosComuns = {
    busca: buscaDebounced || undefined,
    serieId: filtroSerie === "Todas" ? undefined : filtroSerie,
    unidadeId: filtroUnidade === "Todas" ? undefined : filtroUnidade,
    size: rowsPerPage,
  };

  const { leads, totalElements: totalLeads, loading: loadingLeads } = useLeads({
    ...filtrosComuns,
    page: pageLeads,
  });
  const {
    alunos: matriculados,
    totalElements: totalMatriculados,
    loading: loadingMatriculados,
  } = useAlunos({ ...filtrosComuns, page: pageMatriculados });
  const {
    desmatriculados,
    totalElements: totalDesmatriculados,
    loading: loadingDesmatriculados,
  } = useDesmatriculados({ ...filtrosComuns, page: pageDesmatriculados });
  const { turmas, loading: loadingTurmas } = useTurmas();
  const { series } = useSeries();
  const { unidades } = useUnidades();

  // Cada aba pagina por conta própria; o rodapé da tabela só repassa a navegação.
  function paginacao(total: number, page: number, setPage: (page: number) => void): PaginacaoServidor {
    return {
      total,
      pagina: page,
      linhasPorPagina: rowsPerPage,
      opcoesLinhasPorPagina: [10, 20, 50],
      onPagina: setPage,
      onLinhasPorPagina: (linhas) => {
        setRowsPerPage(linhas);
        setPageLeads(0);
        setPageMatriculados(0);
        setPageDesmatriculados(0);
      },
    };
  }

  const [modal, setModal] = useState<ModalType>(null);
  const [ctxAluno, setCtxAluno] = useState<AlunoListaResponse | null>(null);
  const [credenciais, setCredenciais] = useState<AlunoDetalheResponse | null>(null);
  const [turmaSelecionada, setTurmaSelecionada] = useState<number | null>(null);
  const [motivo, setMotivo] = useState("");
  const [alunoDocumentos, setAlunoDocumentos] = useState<AlunoListaResponse | null>(null);

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
            { value: "leads", label: `Leads · ${totalLeads}` },
            { value: "matriculados", label: `Matriculados · ${totalMatriculados}` },
            { value: "desmatriculados", label: `Desmatriculados · ${totalDesmatriculados}` },
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
        <Select
          size="small"
          value={filtroSerie}
          onChange={(e) => setFiltroSerie(e.target.value === "Todas" ? "Todas" : Number(e.target.value))}
        >
          <MenuItem value="Todas">Todas as séries</MenuItem>
          {series.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.nome}
            </MenuItem>
          ))}
        </Select>
        <Select
          size="small"
          value={filtroUnidade}
          onChange={(e) => setFiltroUnidade(e.target.value === "Todas" ? "Todas" : Number(e.target.value))}
        >
          <MenuItem value="Todas">Todas as unidades</MenuItem>
          {unidades.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.nome}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {tab === "leads" && (
        <LeadsTable
          leads={leads}
          loading={loading}
          paginacao={paginacao(totalLeads, pageLeads, setPageLeads)}
          onEditar={(id) => router.push(`${RoutesEnum.ALUNO_CADASTRO}?id=${id}`)}
          onMatricular={abrirMatricular}
          onDocumentos={setAlunoDocumentos}
        />
      )}
      {tab === "matriculados" && (
        <MatriculadosTable
          alunos={matriculados}
          loading={loading}
          paginacao={paginacao(totalMatriculados, pageMatriculados, setPageMatriculados)}
          onVerDetalhe={verDetalhe}
          onVincular={abrirVincular}
          onDesmatricular={abrirDesmatricular}
          onDocumentos={setAlunoDocumentos}
        />
      )}
      {tab === "desmatriculados" && (
        <DesmatriculadosTable
          alunos={desmatriculados}
          loading={loading}
          paginacao={paginacao(totalDesmatriculados, pageDesmatriculados, setPageDesmatriculados)}
          onVerDetalhe={verDetalhe}
          onRematricular={abrirRematricular}
        />
      )}

      <DocumentacaoAlunoDialog
        open={!!alunoDocumentos}
        alunoId={alunoDocumentos?.id ?? null}
        alunoNome={alunoDocumentos?.nome}
        onClose={() => setAlunoDocumentos(null)}
      />

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

/**
 * Dois selos independentes: dados cadastrais (editados no cadastro do aluno)
 * e documentos (enviados e validados no checklist). O de documentos abre o checklist.
 */
function SituacaoCadastro({
  aluno,
  onDocumentos,
}: {
  aluno: AlunoListaResponse;
  onDocumentos: (aluno: AlunoListaResponse) => void;
}) {
  return (
    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }} onClick={(e) => e.stopPropagation()}>
      <Chip
        size="small"
        variant="outlined"
        label={aluno.dadosCompletos ? "Dados ok" : "Dados pendentes"}
        color={aluno.dadosCompletos ? "success" : "warning"}
      />
      <Chip
        size="small"
        variant="outlined"
        clickable
        onClick={() => onDocumentos(aluno)}
        label={aluno.documentacaoCompleta ? "Documentos ok" : "Documentos pendentes"}
        color={aluno.documentacaoCompleta ? "success" : "warning"}
        title="Ver e validar documentos"
      />
    </Box>
  );
}

function colunaCadastro(onDocumentos: (aluno: AlunoListaResponse) => void): ColunaAluno {
  return {
    key: "cadastro",
    label: "Cadastro",
    render: (aluno) => <SituacaoCadastro aluno={aluno} onDocumentos={onDocumentos} />,
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
  paginacao,
  onEditar,
  onMatricular,
  onDocumentos,
}: {
  leads: AlunoListaResponse[];
  loading: boolean;
  paginacao: PaginacaoServidor;
  onEditar: (id: number) => void;
  onMatricular: (aluno: AlunoListaResponse) => void;
  onDocumentos: (aluno: AlunoListaResponse) => void;
}) {
  return (
    <AlunosView
      alunos={leads}
      loading={loading}
      paginacaoServidor={paginacao}
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
        colunaCadastro(onDocumentos),
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
  paginacao,
  onVerDetalhe,
  onVincular,
  onDesmatricular,
  onDocumentos,
}: {
  alunos: AlunoListaResponse[];
  loading: boolean;
  paginacao: PaginacaoServidor;
  onVerDetalhe: (id: number) => void;
  onVincular: (aluno: AlunoListaResponse) => void;
  onDesmatricular: (aluno: AlunoListaResponse) => void;
  onDocumentos: (aluno: AlunoListaResponse) => void;
}) {
  return (
    <AlunosView
      alunos={alunos}
      loading={loading}
      paginacaoServidor={paginacao}
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
        colunaCadastro(onDocumentos),
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
  paginacao,
  onVerDetalhe,
  onRematricular,
}: {
  alunos: AlunoListaResponse[];
  loading: boolean;
  paginacao: PaginacaoServidor;
  onVerDetalhe: (id: number) => void;
  onRematricular: (aluno: AlunoListaResponse) => void;
}) {
  return (
    <AlunosView
      alunos={alunos}
      loading={loading}
      paginacaoServidor={paginacao}
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
