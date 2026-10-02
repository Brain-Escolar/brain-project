"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import { Add, Delete, Edit } from "@mui/icons-material";
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { RoutesEnum } from "@/enums";
import { UserRoleEnum } from "@/enums/UserRoleEnum";
import { useAuth } from "@/hooks/useAuth";
import { useAlunoMutations } from "@/app/(private)/aluno/useAlunoMutations";
import { MIN_CARACTERES_BUSCA, useBuscaAlunosOrientacao } from "@/hooks/useBuscaAlunosOrientacao";
import { useAlunos } from "@/hooks/useAlunos";
import { useSeries } from "@/hooks/useSeries";
import { useTurmas } from "@/hooks/useTurmas";
import { useUnidades } from "@/hooks/useUnidades";
import { AlunoListaResponse } from "@/services/domains/aluno/response";
import { iniciais } from "@/utils/utils";
import * as S from "./styles";

/** Espera entre a digitação e a chamada à API. */
const DEBOUNCE_MS = 350;
/** Opções de tamanho de página oferecidas no rodapé da tabela. */
const LINHAS_POR_PAGINA = [10, 25, 50];
/** Quantas séries viram atalho de um clique no modo compacto. */
const SERIES_COMO_ATALHO = 5;
/** Linhas exibidas no modo compacto, onde não há paginação. */
const LINHAS_MODO_COMPACTO = 8;

const SEM_FILTRO = "";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ColunaAluno {
  key: string;
  label: string;
  /** Largura fixa em px — usada para alinhar colunas entre tabelas irmãs. */
  width?: number;
  align?: "left" | "right" | "center";
  /** Sem `render`, cai no campo homônimo de `AlunoListaResponse`. */
  render?: (aluno: AlunoListaResponse) => React.ReactNode;
}

export interface AlunosViewProps {
  /** Sobrescreve as colunas do preset do perfil. */
  colunas?: ColunaAluno[];
  /** Coluna de ações à direita. */
  acoes?: (aluno: AlunoListaResponse) => React.ReactNode;
  /** Largura fixa da coluna de ações. */
  larguraAcoes?: number;
  /** Rótulo da coluna de ações. */
  labelAcoes?: string;
  /** Default: navega para o detalhe. `null` desativa o clique na linha. */
  onSelecionar?: ((aluno: AlunoListaResponse) => void) | null;
  /** Lista pronta — quando informada, o componente não busca nada nem filtra. */
  alunos?: AlunoListaResponse[];
  loading?: boolean;
  error?: string | null;
  /** Esconde a busca e os filtros próprios (quem passa `alunos` já filtrou). */
  semFiltros?: boolean;
  /** `tableLayout: fixed` — mantém as colunas alinhadas entre tabelas irmãs. */
  larguraFixa?: boolean;
  /** Padrão: paginado nas páginas cheias, inteiro quando a lista vem por prop. */
  paginado?: boolean;
  /** Modo card de dashboard: sem paginação e sem PageScaffold. */
  compacto?: boolean;
  /** Chips de série de um clique. */
  atalhosSerie?: boolean;
  titulo?: string;
  descricao?: string;
  acoesTopo?: React.ReactNode;
  /** Mensagem do estado vazio. */
  mensagemVazio?: string;
}

// ─── Colunas por perfil ───────────────────────────────────────────────────────

function ColunaNome({ aluno }: { aluno: AlunoListaResponse }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
      <Avatar sx={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>
        {iniciais(aluno.nome)}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {aluno.nome}
        </Typography>
        {aluno.nomeSocial && aluno.nomeSocial !== aluno.nome && (
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {aluno.nomeSocial}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

const COLUNA_ALUNO: ColunaAluno = {
  key: "nome",
  label: "Aluno",
  width: 260,
  render: (aluno) => <ColunaNome aluno={aluno} />,
};

const COLUNA_MATRICULA: ColunaAluno = {
  key: "matricula",
  label: "Matrícula",
  render: (aluno) => (
    <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
      {aluno.matricula || "—"}
    </Typography>
  ),
};

const COLUNAS_CONSULTA: ColunaAluno[] = [
  COLUNA_ALUNO,
  COLUNA_MATRICULA,
  { key: "unidade", label: "Unidade" },
  { key: "serie", label: "Série" },
  { key: "turma", label: "Turma" },
];

const COLUNAS_POR_PERFIL: Record<UserRoleEnum, ColunaAluno[]> = {
  [UserRoleEnum.ORIENTADOR]: COLUNAS_CONSULTA,
  [UserRoleEnum.SECRETARIO]: COLUNAS_CONSULTA,
  [UserRoleEnum.PROFESSOR]: COLUNAS_CONSULTA,
  [UserRoleEnum.ESTUDANTE]: COLUNAS_CONSULTA,
  [UserRoleEnum.RESPONSAVEL]: COLUNAS_CONSULTA,
  [UserRoleEnum.ADMIN]: [
    COLUNA_ALUNO,
    COLUNA_MATRICULA,
    { key: "cpf", label: "CPF" },
    { key: "email", label: "E-mail" },
  ],
};

function valorPadrao(aluno: AlunoListaResponse, key: string): React.ReactNode {
  const valor = (aluno as unknown as Record<string, unknown>)[key];
  return typeof valor === "string" || typeof valor === "number" ? valor : "—";
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AlunosView({
  colunas,
  acoes,
  larguraAcoes,
  labelAcoes = "Ações",
  onSelecionar,
  alunos: alunosProp,
  loading: loadingProp,
  error: errorProp,
  semFiltros,
  larguraFixa,
  paginado,
  compacto = false,
  atalhosSerie = false,
  titulo,
  descricao,
  acoesTopo,
  mensagemVazio,
}: AlunosViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const role = user?.role ?? UserRoleEnum.ADMIN;

  // Quem recebe a lista pronta não busca nada por conta própria.
  const listaExterna = alunosProp != null;
  // Só o orientador tem endpoint de busca paginada no servidor; os demais perfis
  // carregam a lista inteira e filtram em memória.
  const usaBuscaServidor = !listaExterna && role === UserRoleEnum.ORIENTADOR;

  const [termo, setTermo] = useState("");
  const [termoDebounced, setTermoDebounced] = useState("");
  const [unidadeId, setUnidadeId] = useState<number | undefined>();
  const [serieId, setSerieId] = useState<number | undefined>();
  const [turmaId, setTurmaId] = useState<number | undefined>();
  const [pagina, setPagina] = useState(0);
  const [linhasPorPagina, setLinhasPorPagina] = useState(LINHAS_POR_PAGINA[0]);

  // Exclusivo do ADMIN: CRUD da lista de cadastro.
  const isAdminCrud = role === UserRoleEnum.ADMIN && !listaExterna && !compacto;

  const tituloVisivel = titulo ?? (isAdminCrud ? "Lista de Alunos" : "Alunos");
  const descricaoVisivel =
    descricao ??
    (isAdminCrud
      ? "Gerencie os alunos cadastrados no sistema"
      : "Consulte os alunos matriculados e abra o detalhamento de cada um.");

  const { deleteAluno } = useAlunoMutations();
  const [alunoParaExcluir, setAlunoParaExcluir] = useState<AlunoListaResponse | null>(null);

  const { unidades } = useUnidades();
  const { series } = useSeries();
  const { turmas } = useTurmas();

  useEffect(() => {
    const timer = setTimeout(() => setTermoDebounced(termo), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [termo]);

  // Qualquer mudança de critério invalida a página atual — sem isso o usuário
  // pode cair numa página que não existe mais no resultado filtrado.
  useEffect(() => {
    setPagina(0);
  }, [termoDebounced, unidadeId, serieId, turmaId]);

  const busca = useBuscaAlunosOrientacao(
    {
      termo: termoDebounced,
      unidadeId,
      serieId,
      turmaId,
      page: pagina,
      size: compacto ? LINHAS_MODO_COMPACTO : linhasPorPagina,
    },
    // No card do dashboard a listagem só começa depois de um critério; na página
    // cheia a lista completa é o estado inicial esperado.
    { exigirCriterio: compacto },
  );

  const lista = useAlunos({ enabled: !listaExterna && !usaBuscaServidor });

  // As turmas do filtro acompanham a série/unidade já escolhidas.
  const turmasDisponiveis = useMemo(
    () =>
      turmas.filter(
        (turma) =>
          (serieId == null || turma.serieId === serieId) &&
          (unidadeId == null || turma.unidadeId === unidadeId),
      ),
    [turmas, serieId, unidadeId],
  );

  const temFiltro = unidadeId != null || serieId != null || turmaId != null;
  const temCriterio = termo.trim() !== "" || temFiltro;

  // Filtro em memória para os perfis sem busca no servidor.
  const alunosFiltrados = useMemo(() => {
    if (usaBuscaServidor) return busca.alunos;
    if (listaExterna) return alunosProp;

    const termoNormalizado = termoDebounced.trim().toLowerCase();
    return lista.alunos.filter((aluno) => {
      const casaTermo =
        termoNormalizado === "" ||
        aluno.nome?.toLowerCase().includes(termoNormalizado) ||
        aluno.nomeSocial?.toLowerCase().includes(termoNormalizado) ||
        aluno.matricula?.toLowerCase().includes(termoNormalizado);
      return (
        casaTermo &&
        (unidadeId == null || aluno.unidadeId === unidadeId) &&
        (serieId == null || aluno.serieId === serieId) &&
        (turmaId == null || aluno.turmaId === turmaId)
      );
    });
  }, [
    usaBuscaServidor,
    listaExterna,
    alunosProp,
    busca.alunos,
    lista.alunos,
    termoDebounced,
    unidadeId,
    serieId,
    turmaId,
  ]);

  const total = usaBuscaServidor ? busca.totalElements : alunosFiltrados.length;
  const loading = listaExterna ? !!loadingProp : usaBuscaServidor ? busca.loading : lista.loading;
  const error = listaExterna ? errorProp ?? null : usaBuscaServidor ? busca.error : lista.error;
  const refetch = usaBuscaServidor ? busca.refetch : lista.refetch;

  // Quem recebe a lista pronta já decide o que mostrar; por isso o padrão ali é
  // exibir tudo, como as telas de Matrículas e Enturmação sempre fizeram.
  const usaPaginacao = paginado ?? (!compacto && !listaExterna);

  // A busca no servidor já devolve só a página pedida; as demais fatiam aqui.
  const alunosVisiveis = useMemo(() => {
    if (usaBuscaServidor) return alunosFiltrados;
    if (compacto) return alunosFiltrados.slice(0, LINHAS_MODO_COMPACTO);
    if (!usaPaginacao) return alunosFiltrados;
    const inicio = pagina * linhasPorPagina;
    return alunosFiltrados.slice(inicio, inicio + linhasPorPagina);
  }, [usaBuscaServidor, compacto, usaPaginacao, alunosFiltrados, pagina, linhasPorPagina]);

  // No card do dashboard nada é listado antes de o usuário pedir.
  const buscaAtiva =
    !compacto || termoDebounced.trim().length >= MIN_CARACTERES_BUSCA || temFiltro;

  const colunasVisiveis = colunas ?? COLUNAS_POR_PERFIL[role] ?? COLUNAS_CONSULTA;

  // O admin herda Editar/Excluir sem que a rota precise passar nada; qualquer
  // chamador que informe `acoes` continua no controle.
  const acoesAdmin = (aluno: AlunoListaResponse) => (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
      <IconButton
        size="small"
        onClick={() => router.push(`${RoutesEnum.ALUNO_CADASTRO}?id=${aluno.id}`)}
        sx={{ color: "primary.main" }}
        title="Editar"
      >
        <Edit fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => setAlunoParaExcluir(aluno)}
        sx={{ color: "error.main" }}
        title="Excluir"
      >
        <Delete fontSize="small" />
      </IconButton>
    </Box>
  );

  const acoesLinha = acoes ?? (isAdminCrud ? acoesAdmin : undefined);

  const acoesCabecalho =
    acoesTopo ??
    (isAdminCrud ? (
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => router.push(RoutesEnum.ALUNO_CADASTRO)}
        sx={{ height: "fit-content" }}
      >
        Novo Aluno
      </Button>
    ) : undefined);

  async function confirmarExclusao() {
    if (!alunoParaExcluir) return;
    try {
      await deleteAluno.mutateAsync(alunoParaExcluir.id.toString());
      setAlunoParaExcluir(null);
    } catch (erro) {
      // O erro já é tratado (toast) dentro de useAlunoMutations.
      console.error("Erro ao deletar aluno:", erro);
    }
  }

  function limparFiltros() {
    setTermo("");
    setTermoDebounced("");
    setUnidadeId(undefined);
    setSerieId(undefined);
    setTurmaId(undefined);
  }

  function alternarSerie(id: number) {
    setSerieId((atual) => (atual === id ? undefined : id));
    setTurmaId(undefined);
  }

  function selecionar(aluno: AlunoListaResponse) {
    if (onSelecionar === null) return;
    if (onSelecionar) {
      onSelecionar(aluno);
      return;
    }
    router.push(`${RoutesEnum.ALUNO_DETALHE}/${aluno.id}`);
  }

  const linhaClicavel = onSelecionar !== null;

  const filtros = !semFiltros && (
    <>
      <TextField
        fullWidth
        size="small"
        placeholder="Nome ou matrícula do aluno..."
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />

      <S.FiltroRow>
        <TextField
          select
          size="small"
          label="Unidade"
          value={unidadeId ?? SEM_FILTRO}
          onChange={(e) => {
            const valor = e.target.value;
            setUnidadeId(valor === SEM_FILTRO ? undefined : Number(valor));
            setTurmaId(undefined);
          }}
        >
          <MenuItem value={SEM_FILTRO}>Todas</MenuItem>
          {unidades.map((unidade) => (
            <MenuItem key={unidade.id} value={unidade.id}>
              {unidade.nome}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Série"
          value={serieId ?? SEM_FILTRO}
          onChange={(e) => {
            const valor = e.target.value;
            setSerieId(valor === SEM_FILTRO ? undefined : Number(valor));
            setTurmaId(undefined);
          }}
        >
          <MenuItem value={SEM_FILTRO}>Todas</MenuItem>
          {series.map((serie) => (
            <MenuItem key={serie.id} value={serie.id}>
              {serie.nome}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Turma"
          value={turmaId ?? SEM_FILTRO}
          onChange={(e) => {
            const valor = e.target.value;
            setTurmaId(valor === SEM_FILTRO ? undefined : Number(valor));
          }}
        >
          <MenuItem value={SEM_FILTRO}>Todas</MenuItem>
          {turmasDisponiveis.map((turma) => (
            <MenuItem key={turma.id} value={turma.id}>
              {turma.nome}
            </MenuItem>
          ))}
        </TextField>
      </S.FiltroRow>

      {atalhosSerie && series.length > 0 && (
        <S.AtalhoRow>
          {series.slice(0, SERIES_COMO_ATALHO).map((serie) => (
            <S.AtalhoChip
              key={serie.id}
              type="button"
              $ativo={serieId === serie.id}
              aria-pressed={serieId === serie.id}
              onClick={() => alternarSerie(serie.id)}
            >
              <PersonSearchOutlinedIcon />
              {serie.nome}
            </S.AtalhoChip>
          ))}
          {temFiltro && (
            <S.AtalhoChip type="button" onClick={limparFiltros}>
              <FilterAltOffOutlinedIcon />
              Limpar filtros
            </S.AtalhoChip>
          )}
        </S.AtalhoRow>
      )}
    </>
  );

  const tabela = (
    <TableContainer component={Paper} sx={{ boxShadow: compacto ? 0 : 1 }}>
      <Table
        sx={{
          minWidth: compacto ? undefined : 720,
          ...(larguraFixa ? { tableLayout: "fixed" } : {}),
        }}
        aria-label="tabela de alunos"
      >
        <TableHead>
          <TableRow sx={{ backgroundColor: "action.hover" }}>
            {colunasVisiveis.map((coluna) => (
              <TableCell
                key={coluna.key}
                align={coluna.align}
                sx={{ fontWeight: "bold", width: coluna.width }}
              >
                {coluna.label}
              </TableCell>
            ))}
            {acoesLinha ? (
              <TableCell align="right" sx={{ fontWeight: "bold", width: larguraAcoes }}>
                {labelAcoes}
              </TableCell>
            ) : (
              linhaClicavel && <TableCell sx={{ width: 48 }} />
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {alunosVisiveis.map((aluno) => (
            <TableRow
              key={aluno.id}
              hover={linhaClicavel}
              tabIndex={linhaClicavel ? 0 : undefined}
              role={linhaClicavel ? "link" : undefined}
              aria-label={linhaClicavel ? `Abrir detalhes de ${aluno.nome}` : undefined}
              onClick={linhaClicavel ? () => selecionar(aluno) : undefined}
              onKeyDown={
                linhaClicavel
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        selecionar(aluno);
                      }
                    }
                  : undefined
              }
              sx={{
                cursor: linhaClicavel ? "pointer" : "default",
                "&:last-child td": { border: 0 },
              }}
            >
              {colunasVisiveis.map((coluna) => (
                <TableCell key={coluna.key} align={coluna.align}>
                  {coluna.render ? coluna.render(aluno) : valorPadrao(aluno, coluna.key)}
                </TableCell>
              ))}
              {acoesLinha ? (
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  {acoesLinha(aluno)}
                </TableCell>
              ) : (
                linhaClicavel && (
                  <TableCell sx={{ textAlign: "center" }}>
                    <ChevronRightIcon fontSize="small" color="disabled" />
                  </TableCell>
                )
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {usaPaginacao && (
        <TablePagination
          component="div"
          count={total}
          page={pagina}
          onPageChange={(_, novaPagina) => setPagina(novaPagina)}
          rowsPerPage={linhasPorPagina}
          onRowsPerPageChange={(e) => {
            setLinhasPorPagina(Number(e.target.value));
            setPagina(0);
          }}
          rowsPerPageOptions={LINHAS_POR_PAGINA}
          labelRowsPerPage="Linhas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      )}
    </TableContainer>
  );

  const resultado = (
    <>
      {error && !compacto && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              Tentar novamente
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      {error && compacto && <S.ErrorHint>{error}</S.ErrorHint>}

      {!error && !buscaAtiva && (
        <S.EmptyHint>
          Digite ao menos {MIN_CARACTERES_BUSCA} caracteres ou escolha um filtro para localizar
          um aluno.
        </S.EmptyHint>
      )}

      {!error && buscaAtiva && loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: compacto ? 2 : 4 }}>
          <CircularProgress size={compacto ? 24 : 40} />
        </Box>
      )}

      {!error && buscaAtiva && !loading && alunosVisiveis.length === 0 && compacto && (
        <S.EmptyHint>Nenhum aluno encontrado com esses critérios.</S.EmptyHint>
      )}

      {!error && buscaAtiva && !loading && alunosVisiveis.length === 0 && !compacto && (
        <BrainResultNotFound
          message={mensagemVazio ?? "Nenhum aluno encontrado"}
          description={
            // Quem passa a lista pronta filtrou fora daqui — a dica sobre "os
            // filtros" seria enganosa, então só a mensagem é exibida.
            listaExterna
              ? undefined
              : temCriterio
                ? "Ajuste a busca ou os filtros para encontrar o aluno."
                : "Não há alunos matriculados para exibir."
          }
        />
      )}

      {!error && buscaAtiva && !loading && alunosVisiveis.length > 0 && tabela}

      {isAdminCrud && (
        <Dialog
          open={alunoParaExcluir !== null}
          onClose={() => setAlunoParaExcluir(null)}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Tem certeza que deseja excluir o aluno <strong>{alunoParaExcluir?.nome}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setAlunoParaExcluir(null)}
              color="inherit"
              disabled={deleteAluno.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarExclusao}
              color="error"
              variant="contained"
              disabled={deleteAluno.isPending}
              startIcon={deleteAluno.isPending ? <CircularProgress size={16} /> : <Delete />}
            >
              {deleteAluno.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );

  if (compacto) {
    return (
      <S.PanelCard>
        <S.PanelHeader>
          <S.PanelTitleGroup>
            <S.PanelTitle>{tituloVisivel}</S.PanelTitle>
            {buscaAtiva && !loading && <S.CountBadge>{total}</S.CountBadge>}
          </S.PanelTitleGroup>
          <S.PanelActions>
            {temCriterio && (
              <S.LinkButton type="button" onClick={limparFiltros}>
                Limpar
              </S.LinkButton>
            )}
            {acoesCabecalho}
          </S.PanelActions>
        </S.PanelHeader>
        {filtros}
        {resultado}
      </S.PanelCard>
    );
  }

  // Quem passa a lista pronta já está dentro da própria página (Matrículas,
  // Enturmação) — nesse caso o componente é só a tabela, sem scaffold.
  if (listaExterna) {
    return <S.Stack>{resultado}</S.Stack>;
  }

  return (
    <PageScaffold title={tituloVisivel} description={descricaoVisivel} actions={acoesCabecalho}>
      <S.Stack>
        <S.FiltrosCard>
          <S.FiltrosHeader>
            <S.FiltrosResumo>
              {loading ? "Carregando alunos..." : `${total} ${total === 1 ? "aluno" : "alunos"}`}
            </S.FiltrosResumo>
            {temCriterio && (
              <S.LinkButton type="button" onClick={limparFiltros}>
                Limpar filtros
              </S.LinkButton>
            )}
          </S.FiltrosHeader>
          {filtros}
        </S.FiltrosCard>
        {resultado}
      </S.Stack>
    </PageScaffold>
  );
}
