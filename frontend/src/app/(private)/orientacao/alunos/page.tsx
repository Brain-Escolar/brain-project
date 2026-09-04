"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
import BrainResultNotFound from "@/components/resultNotFound/resultNotFound";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import { RoutesEnum } from "@/enums";
import { useBuscaAlunosOrientacao } from "@/hooks/useBuscaAlunosOrientacao";
import { useSeries } from "@/hooks/useSeries";
import { useTurmas } from "@/hooks/useTurmas";
import { useUnidades } from "@/hooks/useUnidades";
import * as S from "./styles";

/** Espera entre a digitação e a chamada à API. */
const DEBOUNCE_MS = 350;
/** Opções de tamanho de página oferecidas no rodapé da tabela. */
const LINHAS_POR_PAGINA = [10, 25, 50];

const SEM_FILTRO = "";

export default function AlunosOrientacaoPage() {
  const router = useRouter();

  const [termo, setTermo] = useState("");
  const [termoDebounced, setTermoDebounced] = useState("");
  const [unidadeId, setUnidadeId] = useState<number | undefined>();
  const [serieId, setSerieId] = useState<number | undefined>();
  const [turmaId, setTurmaId] = useState<number | undefined>();
  const [pagina, setPagina] = useState(0);
  const [linhasPorPagina, setLinhasPorPagina] = useState(LINHAS_POR_PAGINA[0]);

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

  const { alunos, totalElements, loading, error, refetch } = useBuscaAlunosOrientacao(
    {
      termo: termoDebounced,
      unidadeId,
      serieId,
      turmaId,
      page: pagina,
      size: linhasPorPagina,
    },
    { exigirCriterio: false },
  );

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

  const temCriterio =
    termo.trim() !== "" || unidadeId != null || serieId != null || turmaId != null;

  function limparFiltros() {
    setTermo("");
    setTermoDebounced("");
    setUnidadeId(undefined);
    setSerieId(undefined);
    setTurmaId(undefined);
  }

  function abrirAluno(alunoId: number) {
    router.push(`${RoutesEnum.ALUNO_DETALHE}/${alunoId}`);
  }

  return (
    <PageScaffold
      title="Alunos"
      description="Consulte os alunos matriculados e abra o detalhamento de cada um."
    >
      <S.Stack>
        <S.FiltrosCard>
          <S.FiltrosHeader>
            <S.FiltrosResumo>
              {loading
                ? "Carregando alunos..."
                : `${totalElements} ${totalElements === 1 ? "aluno" : "alunos"}`}
            </S.FiltrosResumo>
            {temCriterio && (
              <S.LinkButton type="button" onClick={limparFiltros}>
                Limpar filtros
              </S.LinkButton>
            )}
          </S.FiltrosHeader>

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
        </S.FiltrosCard>

        {error && (
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

        {!error && loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!error && !loading && alunos.length === 0 && (
          <BrainResultNotFound
            message="Nenhum aluno encontrado"
            description={
              temCriterio
                ? "Ajuste a busca ou os filtros para encontrar o aluno."
                : "Não há alunos matriculados para exibir."
            }
          />
        )}

        {!error && !loading && alunos.length > 0 && (
          <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
            <Table sx={{ minWidth: 720 }} aria-label="tabela de alunos">
              <TableHead>
                <TableRow sx={{ backgroundColor: "action.hover" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Matrícula</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Unidade</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Série</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Turma</TableCell>
                  <TableCell sx={{ width: 48 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {alunos.map((aluno) => (
                  <TableRow
                    key={aluno.id}
                    hover
                    tabIndex={0}
                    role="link"
                    aria-label={`Abrir detalhes de ${aluno.nome}`}
                    onClick={() => abrirAluno(aluno.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        abrirAluno(aluno.id);
                      }
                    }}
                    sx={{ cursor: "pointer", "&:last-child td": { border: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {aluno.nome}
                      </Typography>
                      {aluno.nomeSocial && aluno.nomeSocial !== aluno.nome && (
                        <Typography variant="caption" color="text.secondary">
                          {aluno.nomeSocial}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{aluno.matricula}</TableCell>
                    <TableCell>{aluno.unidade}</TableCell>
                    <TableCell>{aluno.serie}</TableCell>
                    <TableCell>{aluno.turma}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <ChevronRightIcon fontSize="small" color="disabled" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={totalElements}
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
          </TableContainer>
        )}
      </S.Stack>
    </PageScaffold>
  );
}
