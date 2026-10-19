"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, IconButton, InputAdornment, Skeleton, TextField, Tooltip } from "@mui/material";
import TableViewOutlinedIcon from "@mui/icons-material/TableViewOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import CoPresentOutlinedIcon from "@mui/icons-material/CoPresentOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import GradeOutlinedIcon from "@mui/icons-material/GradeOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import PageScaffold from "@/components/pageScaffold/PageScaffold";
import BrainDropdownField from "@/components/brainForms/_base/brainDropdownField/brainDropdownField";
import { RoutesEnum } from "@/enums";
import { useLembrarProfessores, useProfessoresDiretor } from "@/hooks/useDiretor";
import { ProfessorLinhaResponse, SituacaoProfessor } from "@/services/domains/diretor";
import { exportarCsv } from "@/app/(private)/relatorios/acompanhamento-turma/_components/exportar";
import * as S from "./styles";
import {
  dataHora,
  diaDaSemana,
  diaMes,
  iniciais,
  plural,
  porcentagem,
  situacaoProfessor,
  tomDoDia,
  tomProgresso,
} from "./_components/apresentacao";

const TODAS = "todas";

const OPCOES_SITUACAO: { key: SituacaoProfessor | typeof TODAS; value: string }[] = [
  { key: TODAS, value: "Todas as situações" },
  { key: "EM_DIA", value: "Em dia" },
  { key: "PENDENTE", value: "Com pendências" },
  { key: "SEM_GRADE", value: "Sem aulas na grade" },
  { key: "INATIVO", value: "Inativos" },
];

/** Gestão Escolar › Professores: diário de classe e lançamento de notas de cada docente. */
export default function ProfessoresContent() {
  const router = useRouter();
  const { professores: dados, loading, error } = useProfessoresDiretor();
  const lembrar = useLembrarProfessores();

  const [busca, setBusca] = useState("");
  const [disciplina, setDisciplina] = useState<string>(TODAS);
  const [situacao, setSituacao] = useState<string>(TODAS);

  const disciplinas = useMemo(
    () =>
      [...new Set((dados?.professores ?? []).flatMap((p) => p.disciplinas))].sort((a, b) =>
        a.localeCompare(b, "pt-BR"),
      ),
    [dados],
  );

  const visiveis = useMemo(() => {
    if (!dados) return [];
    const termo = busca.trim().toLowerCase();
    return dados.professores.filter(
      (p) =>
        (!termo || p.nome.toLowerCase().includes(termo)) &&
        (disciplina === TODAS || p.disciplinas.includes(disciplina)) &&
        (situacao === TODAS || p.situacao === situacao),
    );
  }, [dados, busca, disciplina, situacao]);

  const abrir = (p: ProfessorLinhaResponse, aba?: string) =>
    router.push(`${RoutesEnum.GESTAO_PROFESSOR_DETALHE}/${p.id}${aba ? `?aba=${aba}` : ""}`);

  function exportar() {
    if (!dados) return;
    const cabecalho = [
      "Professor",
      "Disciplinas",
      "Turmas",
      "Aulas previstas",
      "Aulas registradas",
      "Aulas sem registro",
      "Avaliações aplicadas",
      "Avaliações lançadas",
      "Avaliações em atraso",
      "Último registro",
      "Situação",
    ];
    const linhas = visiveis.map((p) => [
      p.nome,
      p.disciplinas.join(", "),
      p.turmas,
      p.aulasPrevistas,
      p.aulasRegistradas,
      p.aulasPendentes,
      p.avaliacoesAplicadas,
      p.avaliacoesLancadas,
      p.avaliacoesPendentes,
      dataHora(p.ultimoRegistro),
      situacaoProfessor(p).rotulo,
    ]);
    exportarCsv(`Acompanhamento docente - ${dados.periodo.nome}`, [cabecalho, ...linhas]);
  }

  const comPendencia = dados?.resumo.professoresComPendencia ?? 0;
  const acoes = (
    <S.Acoes>
      <Button variant="outlined" startIcon={<TableViewOutlinedIcon />} onClick={exportar} disabled={!dados}>
        Exportar
      </Button>
      <Button
        variant="contained"
        startIcon={<NotificationsActiveOutlinedIcon />}
        onClick={() => lembrar.mutate(undefined)}
        disabled={!dados || comPendencia === 0 || lembrar.isPending}
      >
        Lembrar pendentes{comPendencia > 0 ? ` (${comPendencia})` : ""}
      </Button>
    </S.Acoes>
  );

  return (
    <PageScaffold
      title="Professores"
      description="Acompanhe o diário de classe, o lançamento de notas e as anotações de cada docente."
      actions={acoes}
    >
      <S.Page>
        {error ? (
          <S.Vazio>
            <strong>{error}</strong>
            <span>Tente novamente em instantes.</span>
          </S.Vazio>
        ) : loading || !dados ? (
          <>
            <S.KpiGrid>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rounded" height={118} />
              ))}
            </S.KpiGrid>
            <Skeleton variant="rounded" height={420} />
          </>
        ) : (
          <>
            <S.KpiGrid>
              <S.Kpi>
                <S.KpiTopo>
                  Professores ativos
                  <S.KpiIcone $tom="primary">
                    <CoPresentOutlinedIcon />
                  </S.KpiIcone>
                </S.KpiTopo>
                <S.KpiValor>{dados.resumo.professoresAtivos}</S.KpiValor>
                <S.KpiNota>
                  {dados.resumo.professoresSemGrade
                    ? `${plural(dados.resumo.professoresSemGrade, "sem aulas", "sem aulas")} na grade`
                    : "Todos com aulas na grade"}
                </S.KpiNota>
              </S.Kpi>
              <S.Kpi>
                <S.KpiTopo>
                  Professores em dia
                  <S.KpiIcone $tom="success">
                    <TaskAltOutlinedIcon />
                  </S.KpiIcone>
                </S.KpiTopo>
                <S.KpiValor>
                  {dados.resumo.diariosEmDia}/{dados.resumo.professoresComGrade}
                </S.KpiValor>
                <S.KpiNota>Diário e notas sem pendência</S.KpiNota>
              </S.Kpi>
              <S.Kpi>
                <S.KpiTopo>
                  Aulas sem registro
                  <S.KpiIcone $tom={dados.resumo.aulasPendentes ? "warning" : "success"}>
                    <PendingActionsOutlinedIcon />
                  </S.KpiIcone>
                </S.KpiTopo>
                <S.KpiValor>{dados.resumo.aulasPendentes}</S.KpiValor>
                <S.KpiNota>Conteúdo e chamada não lançados no {dados.periodo.nome.toLowerCase()}</S.KpiNota>
              </S.Kpi>
              <S.Kpi>
                <S.KpiTopo>
                  Notas em atraso
                  <S.KpiIcone $tom={dados.resumo.avaliacoesPendentes ? "error" : "success"}>
                    <GradeOutlinedIcon />
                  </S.KpiIcone>
                </S.KpiTopo>
                <S.KpiValor>{dados.resumo.avaliacoesPendentes}</S.KpiValor>
                <S.KpiNota>
                  Avaliações após o prazo de entrega · fim do período em {diaMes(dados.periodo.fim)}
                </S.KpiNota>
              </S.Kpi>
            </S.KpiGrid>

            <S.Painel>
              <TextField
                size="small"
                placeholder="Buscar professor"
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
              <BrainDropdownField<string>
                label="Disciplina"
                value={disciplina}
                disableClearable
                onChange={(v) => setDisciplina(v ?? TODAS)}
                options={[
                  { key: TODAS, value: "Todas as disciplinas" },
                  ...disciplinas.map((d) => ({ key: d, value: d })),
                ]}
              />
              <BrainDropdownField<string>
                label="Situação"
                value={situacao}
                disableClearable
                onChange={(v) => setSituacao(v ?? TODAS)}
                options={OPCOES_SITUACAO}
              />
            </S.Painel>

            <S.TabelaWrap>
              <S.Rolagem>
                <S.Tabela $clicavel>
                  <thead>
                    <tr>
                      <th>Professor</th>
                      <th style={{ textAlign: "right" }}>Turmas</th>
                      <th>Diário da semana</th>
                      <th>Aulas no período</th>
                      <th>Notas no período</th>
                      <th>Último registro</th>
                      <th>Situação</th>
                      <th style={{ width: 96 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {visiveis.map((p) => {
                      const situ = situacaoProfessor(p);
                      return (
                        <tr key={p.id} onClick={() => abrir(p)}>
                          <td>
                            <S.PessoaCelula>
                              <S.Iniciais>{iniciais(p.nome)}</S.Iniciais>
                              <div>
                                <strong>{p.nome}</strong>
                                <small>{p.disciplinas.join(", ") || "Sem disciplina na grade"}</small>
                              </div>
                            </S.PessoaCelula>
                          </td>
                          <S.Num $direita>{p.turmas}</S.Num>
                          <td>
                            <S.Semana>
                              {p.semana.map((d, i) => {
                                const feriado = dados.semana[i]?.feriado;
                                const titulo = feriado
                                  ? `${diaMes(d.data)} · ${feriado}`
                                  : d.aulas === 0
                                    ? `${diaMes(d.data)} · sem aulas`
                                    : `${diaMes(d.data)} · ${plural(d.aulas, "aula", "aulas")}, ` +
                                      `${d.registradas} registrada${d.registradas === 1 ? "" : "s"}` +
                                      (d.pendentes ? `, ${d.pendentes} sem registro` : "");
                                return (
                                  <Tooltip key={d.data} title={titulo} arrow>
                                    <S.DiaSemana>
                                      <S.Ponto $tom={tomDoDia(d)} />
                                      {diaDaSemana(d.data)}
                                    </S.DiaSemana>
                                  </Tooltip>
                                );
                              })}
                            </S.Semana>
                          </td>
                          <td>
                            {p.aulasPrevistas ? (
                              <S.BarraProgresso>
                                <span>
                                  {p.aulasRegistradas}/{p.aulasPrevistas} registradas
                                </span>
                                <S.Trilho>
                                  <S.Preenchido
                                    $pct={porcentagem(p.aulasRegistradas, p.aulasPrevistas)}
                                    $tom={tomProgresso(p.aulasRegistradas, p.aulasPrevistas)}
                                  />
                                </S.Trilho>
                              </S.BarraProgresso>
                            ) : (
                              <S.TextoSuave>—</S.TextoSuave>
                            )}
                          </td>
                          <td>
                            {p.avaliacoesAplicadas ? (
                              <S.BarraProgresso>
                                <span>
                                  {p.avaliacoesLancadas}/{p.avaliacoesAplicadas} lançadas
                                </span>
                                <S.Trilho>
                                  <S.Preenchido
                                    $pct={porcentagem(p.avaliacoesLancadas, p.avaliacoesAplicadas)}
                                    $tom={p.avaliacoesPendentes ? "warning" : "success"}
                                  />
                                </S.Trilho>
                              </S.BarraProgresso>
                            ) : (
                              <S.TextoSuave>Nenhuma aplicada</S.TextoSuave>
                            )}
                          </td>
                          <S.Num $suave={!p.ultimoRegistro}>{dataHora(p.ultimoRegistro)}</S.Num>
                          <td>
                            <S.Selo $tom={situ.tom}>{situ.rotulo}</S.Selo>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <Tooltip title="Ver diário de classe">
                              <IconButton size="small" onClick={() => abrir(p, "diario")}>
                                <MenuBookOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              title={p.situacao === "PENDENTE" ? "Enviar lembrete" : "Sem pendências"}
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={p.situacao !== "PENDENTE" || lembrar.isPending}
                                  onClick={() => lembrar.mutate([p.id])}
                                >
                                  <NotificationsNoneOutlinedIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </S.Tabela>
              </S.Rolagem>
              {visiveis.length === 0 && (
                <S.Vazio>
                  <SearchOffIcon />
                  <strong>Nenhum professor encontrado</strong>
                  <span>Ajuste os filtros ou a busca para ver mais resultados.</span>
                </S.Vazio>
              )}
              <S.Rodape>
                <span>
                  {plural(visiveis.length, "professor", "professores")} · {dados.professores.length} no total ·{" "}
                  {dados.periodo.nome}
                </span>
                <S.Legenda>
                  <span>
                    <S.Ponto $tom="success" />
                    Registrado
                  </span>
                  <span>
                    <S.Ponto $tom="warning" />
                    Sem registro
                  </span>
                  <span>
                    <S.Ponto $tom="primary" />A realizar
                  </span>
                  <span>
                    <S.Ponto $tom="neutral" />
                    Sem aulas
                  </span>
                </S.Legenda>
              </S.Rodape>
            </S.TabelaWrap>
          </>
        )}
      </S.Page>
    </PageScaffold>
  );
}
