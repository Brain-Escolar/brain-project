"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircularProgress,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import { RoutesEnum } from "@/enums";
import { useSeries } from "@/hooks/useSeries";
import { useTurmas } from "@/hooks/useTurmas";
import { useUnidades } from "@/hooks/useUnidades";
import { MIN_CARACTERES_BUSCA, useBuscaAlunosOrientacao } from "@/hooks/useBuscaAlunosOrientacao";
import * as S from "./styles";

/** Espera entre a digitação e a chamada à API. */
const DEBOUNCE_MS = 350;
/** Quantas séries viram atalho de um clique. */
const SERIES_COMO_ATALHO = 5;

const SEM_FILTRO = "";

export default function SectionBuscaAlunos() {
  const router = useRouter();

  const [termo, setTermo] = useState("");
  const [termoDebounced, setTermoDebounced] = useState("");
  const [unidadeId, setUnidadeId] = useState<number | undefined>();
  const [serieId, setSerieId] = useState<number | undefined>();
  const [turmaId, setTurmaId] = useState<number | undefined>();

  const { unidades } = useUnidades();
  const { series } = useSeries();
  const { turmas } = useTurmas();

  useEffect(() => {
    const timer = setTimeout(() => setTermoDebounced(termo), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [termo]);

  const { alunos, totalElements, loading, error } = useBuscaAlunosOrientacao({
    termo: termoDebounced,
    unidadeId,
    serieId,
    turmaId,
  });

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
  const buscaAtiva = termoDebounced.trim().length >= MIN_CARACTERES_BUSCA || temFiltro;

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

  return (
    <S.PanelCard>
      <S.PanelHeader>
        <S.PanelTitleGroup>
          <S.PanelTitle>Buscar alunos</S.PanelTitle>
          {buscaAtiva && !loading && <S.CountBadge>{totalElements}</S.CountBadge>}
        </S.PanelTitleGroup>
        {(temFiltro || termo) && (
          <S.LinkButton type="button" onClick={limparFiltros}>
            Limpar
          </S.LinkButton>
        )}
      </S.PanelHeader>

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

      {series.length > 0 && (
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

      {error && <S.ErrorHint>{error}</S.ErrorHint>}

      {!error && !buscaAtiva && (
        <S.EmptyHint>
          Digite ao menos {MIN_CARACTERES_BUSCA} caracteres ou escolha um filtro para localizar um
          aluno.
        </S.EmptyHint>
      )}

      {!error && buscaAtiva && loading && <CircularProgress size={24} sx={{ alignSelf: "center" }} />}

      {!error && buscaAtiva && !loading && alunos.length === 0 && (
        <S.EmptyHint>Nenhum aluno encontrado com esses critérios.</S.EmptyHint>
      )}

      {!error && buscaAtiva && !loading && alunos.length > 0 && (
        <S.RowList>
          {alunos.map((aluno) => (
            <S.Row
              key={aluno.id}
              type="button"
              onClick={() => router.push(`${RoutesEnum.ALUNO_DETALHE}/${aluno.id}`)}
            >
              <S.RowIcon>
                <PersonSearchOutlinedIcon />
              </S.RowIcon>
              <S.RowBody>
                <S.RowTitle>{aluno.nomeSocial || aluno.nome}</S.RowTitle>
                <S.RowMeta>
                  {[aluno.matricula, aluno.serie, aluno.turma, aluno.unidade]
                    .filter(Boolean)
                    .join(" · ")}
                </S.RowMeta>
              </S.RowBody>
              <S.RowAside>
                <ChevronRightIcon fontSize="small" color="disabled" />
              </S.RowAside>
            </S.Row>
          ))}
        </S.RowList>
      )}
    </S.PanelCard>
  );
}
