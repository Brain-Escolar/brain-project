"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, InputAdornment, LinearProgress, Skeleton, TextField } from "@mui/material";
import TableViewOutlinedIcon from "@mui/icons-material/TableViewOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import GradeOutlinedIcon from "@mui/icons-material/GradeOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import SearchIcon from "@mui/icons-material/Search";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import SegmentedControl from "@/components/segmentedControl/segmentedControl";
import BrainDropdownField from "@/components/brainForms/_base/brainDropdownField/brainDropdownField";
import { useAcompanhamentoTurma, useFiltrosAcompanhamento } from "@/hooks/useDiretor";
import { AlunoAcompanhamentoResponse } from "@/services/domains/diretor";
import { formatarDecimal, formatarPercentual } from "@/utils/formatoNumero";
import * as S from "./styles";
import TabelaAlunos, { ChaveOrdem, Ordem, ordenarAlunos } from "./_components/TabelaAlunos";
import TabelaDisciplinas from "./_components/TabelaDisciplinas";
import ListaAnotacoes from "./_components/ListaAnotacoes";
import DrawerAluno from "./_components/DrawerAluno";
import { exportarCsv, exportarPdf } from "./_components/exportar";
import { descricaoCriterios, nomeTurma, plural, rotuloTurma } from "./_components/apresentacao";

type Visao = "alunos" | "disciplinas" | "anotacoes";

const TODAS = "todas";
const ACUMULADO = "acumulado";

/** Acompanhamento por turma da Direção: notas, faltas, atrasos e comportamento. */
export default function AcompanhamentoTurmaContent() {
  const { filtros, loading: carregandoFiltros, error: erroFiltros } = useFiltrosAcompanhamento();

  const [unidade, setUnidade] = useState<string>(TODAS);
  const [turmaId, setTurmaId] = useState<number | undefined>();
  const [periodo, setPeriodo] = useState<string>(ACUMULADO);
  const [disciplina, setDisciplina] = useState<string>(TODAS);
  const [visao, setVisao] = useState<Visao>("alunos");
  const [busca, setBusca] = useState("");
  const [soAtencao, setSoAtencao] = useState(false);
  const [ordem, setOrdem] = useState<Ordem>({ chave: "nome", direcao: 1 });
  const [tipoAnotacao, setTipoAnotacao] = useState(TODAS);
  const [alunoAberto, setAlunoAberto] = useState<number | null>(null);
  const relatorioRef = useRef<HTMLDivElement>(null);

  const unidades = useMemo(() => {
    const mapa = new Map<number, string>();
    filtros?.turmas.forEach((t) => mapa.set(t.unidadeId, t.unidade));
    return [...mapa.entries()];
  }, [filtros]);

  const turmasDaUnidade = useMemo(
    () =>
      (filtros?.turmas ?? []).filter((t) => unidade === TODAS || String(t.unidadeId) === unidade),
    [filtros, unidade],
  );

  // A turma escolhida precisa existir na unidade filtrada; senão cai na primeira.
  useEffect(() => {
    if (turmasDaUnidade.length && !turmasDaUnidade.some((t) => t.id === turmaId)) {
      setTurmaId(turmasDaUnidade[0].id);
      setDisciplina(TODAS);
    }
  }, [turmasDaUnidade, turmaId]);

  const {
    acompanhamento: dados,
    loading,
    atualizando,
    error,
  } = useAcompanhamentoTurma(turmaId, {
    periodo: periodo === ACUMULADO ? undefined : Number(periodo),
    disciplinaId: disciplina === TODAS ? undefined : Number(disciplina),
  });

  const disciplinaNome =
    dados?.disciplinaId != null
      ? (dados.disciplinas.find((d) => d.id === dados.disciplinaId)?.nome ?? null)
      : null;

  const alunosVisiveis = useMemo(() => {
    if (!dados) return [];
    const termo = busca.trim().toLowerCase();
    const filtrados = dados.alunos.filter(
      (a) =>
        (!soAtencao || a.motivosAtencao.length > 0) &&
        (!termo || a.nome.toLowerCase().includes(termo) || (a.matricula ?? "").includes(termo)),
    );
    return ordenarAlunos(filtrados, ordem);
  }, [dados, busca, soAtencao, ordem]);

  const alunoDrawer = dados?.alunos.find((a) => a.id === alunoAberto) ?? null;

  function ordenar(chave: ChaveOrdem) {
    setOrdem((atual) => ({
      chave,
      direcao: atual.chave === chave ? ((atual.direcao * -1) as 1 | -1) : chave === "nome" ? 1 : -1,
    }));
  }

  const tituloRecorte = dados
    ? [nomeTurma(dados.turma), dados.periodo, disciplinaNome].filter(Boolean).join(" · ")
    : "";

  function exportarPlanilha() {
    if (!dados) return;
    const cabecalho = [
      "Aluno",
      "Matrícula",
      disciplinaNome ? `Nota ${disciplinaNome}` : "Média",
      "Disciplinas abaixo da média",
      "Faltas",
      "Frequência",
      "Atrasos",
      "Anotações",
      "Situação",
    ];
    const linhas = alunosVisiveis.map((a: AlunoAcompanhamentoResponse) => [
      a.nome,
      a.matricula ?? "",
      formatarDecimal(a.media),
      a.geral.disciplinasAbaixo,
      a.faltas,
      formatarPercentual(a.frequencia),
      a.atrasos,
      a.anotacoes,
      a.motivosAtencao.length ? `Em atenção: ${a.motivosAtencao.join(", ")}` : "Regular",
    ]);
    exportarCsv(`Acompanhamento ${tituloRecorte}`, [cabecalho, ...linhas]);
  }

  const resumoAtencao = useMemo(() => {
    if (!dados) return "";
    const emAtencao = dados.alunos.filter((a) => a.motivosAtencao.length);
    const conta = (re: RegExp) =>
      emAtencao.filter((a) => a.motivosAtencao.some((m) => re.test(m))).length;
    return (
      [
        [conta(/média|disciplinas/), "notas"],
        [conta(/frequência/), "frequência"],
        [conta(/atrasos/), "atrasos"],
        [conta(/anotações/), "comportamento"],
      ] as [number, string][]
    )
      .filter(([n]) => n > 0)
      .map(([n, rotulo]) => `${n} por ${rotulo}`)
      .join(" · ");
  }, [dados]);

  const acoes = (
    <S.Acoes>
      <Button
        variant="outlined"
        startIcon={<TableViewOutlinedIcon />}
        onClick={exportarPlanilha}
        disabled={!dados}
      >
        Exportar Excel
      </Button>
      <Button
        variant="outlined"
        startIcon={<PictureAsPdfOutlinedIcon />}
        onClick={() => exportarPdf(relatorioRef.current, tituloRecorte)}
        disabled={!dados}
      >
        Exportar PDF
      </Button>
    </S.Acoes>
  );

  return (
    <PageScaffold
      title="Acompanhamento por turma"
      description="Notas, faltas, atrasos e anotações de comportamento de cada turma."
      actions={acoes}
    >
      <S.Page>
        <S.Painel>
          <BrainDropdownField<string>
            label="Unidade"
            value={unidade}
            disableClearable
            disabled={carregandoFiltros}
            onChange={(v) => setUnidade(v ?? TODAS)}
            options={[
              { key: TODAS, value: "Todas as unidades" },
              ...unidades.map(([id, nome]) => ({ key: String(id), value: nome })),
            ]}
          />
          <BrainDropdownField<string>
            label="Turma"
            value={turmaId != null ? String(turmaId) : ""}
            disableClearable
            disabled={carregandoFiltros || turmasDaUnidade.length === 0}
            onChange={(v) => {
              if (!v) return;
              setTurmaId(Number(v));
              setDisciplina(TODAS);
              setBusca("");
              setAlunoAberto(null);
            }}
            options={turmasDaUnidade.map((t) => ({ key: String(t.id), value: rotuloTurma(t) }))}
          />
          <BrainDropdownField<string>
            label="Período"
            value={periodo}
            disableClearable
            disabled={carregandoFiltros}
            onChange={(v) => setPeriodo(v ?? ACUMULADO)}
            options={[
              { key: ACUMULADO, value: `Acumulado ${filtros?.anoLetivo ?? ""}`.trim() },
              ...(filtros?.periodos ?? []).map((p) => ({
                key: String(p.sequencia),
                value: p.atual ? `${p.nome} (atual)` : p.nome,
                disabled: !p.iniciado,
              })),
            ]}
          />
          <BrainDropdownField<string>
            label="Disciplina"
            value={disciplina}
            disableClearable
            disabled={!dados}
            onChange={(v) => setDisciplina(v ?? TODAS)}
            options={[
              { key: TODAS, value: "Todas as disciplinas" },
              ...(dados?.disciplinas ?? []).map((d) => ({ key: String(d.id), value: d.nome })),
            ]}
          />
        </S.Painel>

        {erroFiltros || error ? (
          <S.Vazio>
            <strong>{erroFiltros ?? error}</strong>
            <span>Tente novamente em instantes.</span>
          </S.Vazio>
        ) : !carregandoFiltros && filtros?.turmas.length === 0 ? (
          <S.Vazio>
            <strong>Nenhuma turma cadastrada em {filtros.anoLetivo}</strong>
            <span>Cadastre as turmas do ano letivo para acompanhar o desempenho.</span>
          </S.Vazio>
        ) : loading || !dados ? (
          <>
            <Skeleton variant="rounded" height={118} />
            <Skeleton variant="rounded" height={360} />
          </>
        ) : (
          <S.Relatorio ref={relatorioRef}>
            {atualizando && <LinearProgress data-noprint sx={{ borderRadius: 1 }} />}
            <S.TurmaTitulo>
              <strong>{nomeTurma(dados.turma)}</strong>
              <span>
                {[
                  dados.turma.unidade,
                  dados.turma.turno,
                  dados.turma.sala,
                  plural(dados.turma.totalAlunos, "aluno", "alunos"),
                  dados.periodo,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </S.TurmaTitulo>

            <S.KpiGrid>
              <S.Kpi>
                <S.KpiTopo>
                  {disciplinaNome ? `Média em ${disciplinaNome}` : "Média da turma"}
                  <S.KpiIcone $tom="primary">
                    <GradeOutlinedIcon />
                  </S.KpiIcone>
                </S.KpiTopo>
                <S.KpiValor>{formatarDecimal(dados.resumo.mediaTurma)}</S.KpiValor>
                <S.KpiNota>
                  {plural(dados.resumo.alunosAbaixoMedia, "aluno", "alunos")} abaixo de{" "}
                  {formatarDecimal(dados.criterios.mediaMinima)}
                </S.KpiNota>
              </S.Kpi>
              <S.Kpi>
                <S.KpiTopo>
                  Frequência média
                  <S.KpiIcone $tom="success">
                    <EventAvailableOutlinedIcon />
                  </S.KpiIcone>
                </S.KpiTopo>
                <S.KpiValor>{formatarPercentual(dados.resumo.frequenciaMedia, 0)}</S.KpiValor>
                <S.KpiNota>
                  {plural(dados.resumo.alunosAbaixoFrequencia, "aluno", "alunos")} abaixo de{" "}
                  {formatarDecimal(dados.criterios.frequenciaMinima, 0)}%
                </S.KpiNota>
              </S.Kpi>
              <S.Kpi>
                <S.KpiTopo>
                  Atrasos
                  <S.KpiIcone $tom="warning">
                    <ScheduleOutlinedIcon />
                  </S.KpiIcone>
                </S.KpiTopo>
                <S.KpiValor>{dados.resumo.totalAtrasos}</S.KpiValor>
                <S.KpiNota>
                  {plural(
                    dados.resumo.alunosComAtrasosRecorrentes,
                    "aluno com atrasos recorrentes",
                    "alunos com atrasos recorrentes",
                  )}
                </S.KpiNota>
              </S.Kpi>
              <S.Kpi>
                <S.KpiTopo>
                  Anotações
                  <S.KpiIcone $tom="info">
                    <RateReviewOutlinedIcon />
                  </S.KpiIcone>
                </S.KpiTopo>
                <S.KpiValor>{dados.resumo.totalAnotacoes}</S.KpiValor>
                <S.KpiNota>
                  {plural(
                    dados.resumo.alunosComAnotacoes,
                    "aluno com anotação",
                    "alunos com anotação",
                  )}
                </S.KpiNota>
              </S.Kpi>
            </S.KpiGrid>

            {dados.resumo.alunosEmAtencao > 0 && (
              <S.Aviso data-noprint>
                <PriorityHighIcon />
                <S.AvisoTexto>
                  <strong>
                    {dados.resumo.alunosEmAtencao === 1
                      ? "1 aluno precisa de atenção"
                      : `${dados.resumo.alunosEmAtencao} alunos precisam de atenção`}{" "}
                    em {dados.periodo.toLowerCase()}
                  </strong>
                  <span>{resumoAtencao}</span>
                </S.AvisoTexto>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  startIcon={soAtencao ? <FilterAltOffOutlinedIcon /> : <FilterAltOutlinedIcon />}
                  onClick={() => {
                    setSoAtencao((v) => !v);
                    setVisao("alunos");
                  }}
                  sx={{ bgcolor: "var(--colors-backgroundSection)" }}
                >
                  {soAtencao ? "Mostrar todos" : "Ver só esses alunos"}
                </Button>
              </S.Aviso>
            )}

            <S.BarraVisao data-noprint>
              <SegmentedControl<Visao>
                ariaLabel="Visão do relatório"
                value={visao}
                onChange={setVisao}
                options={[
                  { value: "alunos", label: "Alunos" },
                  { value: "disciplinas", label: "Disciplinas" },
                  { value: "anotacoes", label: "Anotações" },
                ]}
              />
              {visao === "alunos" && (
                <TextField
                  size="small"
                  placeholder="Buscar aluno na turma"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  sx={{ width: { xs: "100%", sm: 280 } }}
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
              )}
            </S.BarraVisao>

            {visao === "alunos" && (
              <TabelaAlunos
                alunos={alunosVisiveis}
                criterios={dados.criterios}
                disciplinaNome={disciplinaNome}
                ordem={ordem}
                onOrdenar={ordenar}
                onAbrir={(a) => setAlunoAberto(a.id)}
                resumo={
                  `${alunosVisiveis.length} de ${dados.alunos.length} alunos` +
                  (soAtencao ? " · só em atenção" : "") +
                  (disciplinaNome ? ` · ${disciplinaNome}` : "")
                }
                criterio={descricaoCriterios(dados)}
              />
            )}

            {visao === "disciplinas" && (
              <TabelaDisciplinas
                disciplinas={dados.desempenhoDisciplinas}
                criterios={dados.criterios}
                criterio={descricaoCriterios(dados)}
                onVer={(id) => {
                  setDisciplina(String(id));
                  setVisao("alunos");
                  setOrdem({ chave: "media", direcao: 1 });
                }}
              />
            )}

            {visao === "anotacoes" && (
              <ListaAnotacoes
                anotacoes={dados.anotacoes}
                tipo={tipoAnotacao}
                onTipo={setTipoAnotacao}
                onAbrirAluno={setAlunoAberto}
              />
            )}
          </S.Relatorio>
        )}
      </S.Page>

      {dados && (
        <DrawerAluno
          aluno={alunoDrawer}
          anotacoes={dados.anotacoes}
          criterios={dados.criterios}
          turma={nomeTurma(dados.turma)}
          periodo={dados.periodo}
          onFechar={() => setAlunoAberto(null)}
        />
      )}
    </PageScaffold>
  );
}
