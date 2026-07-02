"use client";
import Badge from "@/components/badge";
import { useAvaliacao } from "@/hooks/useAvaliacao";
import { useAvaliacaoTurmas } from "@/hooks/useAvaliacaoTurmas";
import { useMinhasTurmas } from "@/hooks/useMinhasTurmas";
import { RoutesEnum } from "@/enums";
import { cssVarColor } from "@/styles";
import { TipoAvaliacao } from "@/services/domains/avaliacao/request";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import EditCalendarRounded from "@mui/icons-material/EditCalendarRounded";
import EditNoteRounded from "@mui/icons-material/EditNoteRounded";
import MoreHorizRounded from "@mui/icons-material/MoreHorizRounded";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useAvaliacaoMutations } from "../useAvaliacaoMutations";
import { useAvaliacaoTurmaMutations } from "./useAvaliacaoTurmaMutations";
import * as S from "./styles";

const TIPOS: { value: TipoAvaliacao; label: string }[] = [
  { value: "PROVA", label: "Prova" },
  { value: "TRABALHO", label: "Trabalho" },
  { value: "LISTA", label: "Lista" },
  { value: "SEMINARIO", label: "Seminário" },
];

function AvaliacaoDetalheContent() {
  const searchParams = useSearchParams();
  const avaliacaoId = searchParams.get("id") ?? "";
  const router = useRouter();

  const { avaliacao, loading, error } = useAvaliacao(avaliacaoId);
  const { turmas, loading: loadingTurmas } = useAvaliacaoTurmas(avaliacaoId);
  const { disciplinas: minhasTurmas } = useMinhasTurmas();
  const { updateAvaliacao } = useAvaliacaoMutations();
  const { adicionarTurma, atualizarDatasTurma, removerTurma } = useAvaliacaoTurmaMutations(avaliacaoId);

  const [nome, setNome] = useState("");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [tipo, setTipo] = useState<TipoAvaliacao>("PROVA");
  const [notaMaxima, setNotaMaxima] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [notaExtra, setNotaExtra] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [datasEdicao, setDatasEdicao] = useState<Record<number, { dataAplicacao: string; dataEntregaNotas: string }>>(
    {},
  );
  const [turmaEditandoDatas, setTurmaEditandoDatas] = useState<number | null>(null);
  const [novaTurmaId, setNovaTurmaId] = useState("");

  useEffect(() => {
    if (!avaliacao) return;
    setNome(avaliacao.nome);
    setDisciplinaId(String(avaliacao.disciplinaId));
    setTipo(avaliacao.tipo);
    setNotaMaxima(String(avaliacao.notaMaxima));
    setConteudo(avaliacao.conteudo ?? "");
    setNotaExtra(avaliacao.notaExtra);
  }, [avaliacao]);

  useEffect(() => {
    const proximo: Record<number, { dataAplicacao: string; dataEntregaNotas: string }> = {};
    turmas.forEach((t) => {
      proximo[t.id] = {
        dataAplicacao: t.dataAplicacao ?? "",
        dataEntregaNotas: t.dataEntregaNotas ?? "",
      };
    });
    setDatasEdicao(proximo);
  }, [turmas]);

  const turmasDisponiveisParaAdicionar = useMemo(() => {
    const disciplina = minhasTurmas.find((d) => String(d.disciplinaId) === disciplinaId);
    if (!disciplina) return [];
    const vinculadas = new Set(turmas.map((t) => t.turmaId));
    return disciplina.turmas
      .filter((t) => !vinculadas.has(t.turmaId))
      .map((t) => ({ turmaId: t.turmaId, label: `${t.serieNome} ${t.nomeTurma}` }));
  }, [minhasTurmas, disciplinaId, turmas]);

  const dirty =
    !!avaliacao &&
    (nome !== avaliacao.nome ||
      disciplinaId !== String(avaliacao.disciplinaId) ||
      tipo !== avaliacao.tipo ||
      notaMaxima !== String(avaliacao.notaMaxima) ||
      conteudo !== (avaliacao.conteudo ?? "") ||
      notaExtra !== avaliacao.notaExtra);

  useEffect(() => setSalvo(false), [nome, disciplinaId, tipo, notaMaxima, conteudo, notaExtra]);

  function handleSalvarConteudo() {
    updateAvaliacao.mutate(
      {
        id: avaliacaoId,
        nome,
        disciplinaId: Number(disciplinaId),
        tipo,
        notaMaxima: Number(notaMaxima.replace(",", ".")),
        conteudo,
        notaExtra,
      },
      { onSuccess: () => setSalvo(true) },
    );
  }

  function handleAdicionarTurma() {
    if (!novaTurmaId) return;
    adicionarTurma.mutate({ turmaId: Number(novaTurmaId) });
    setNovaTurmaId("");
  }

  function handleSalvarDatasTurma(avaliacaoTurmaId: number) {
    const datas = datasEdicao[avaliacaoTurmaId];
    atualizarDatasTurma.mutate(
      {
        avaliacaoTurmaId,
        dados: {
          dataAplicacao: datas?.dataAplicacao || undefined,
          dataEntregaNotas: datas?.dataEntregaNotas || undefined,
        },
      },
      { onSuccess: () => setTurmaEditandoDatas(null) },
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !avaliacao) {
    return <Alert severity="error">Erro ao carregar a avaliação. Por favor, tente novamente.</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 3.5 }, pb: 6 }}>
      <S.PageHeader>
        <S.BackLink onClick={() => router.push(RoutesEnum.AVALIACOES)}>
          <ArrowBackRounded />
          Avaliações
        </S.BackLink>

        <S.TitleRow>
          <S.Title>{avaliacao.nome}</S.Title>
          <S.Subtitle>
            {avaliacao.disciplina} · {TIPOS.find((t) => t.value === avaliacao.tipo)?.label}
          </S.Subtitle>
        </S.TitleRow>
      </S.PageHeader>

      <S.DetailGrid>
        <S.EditPanel>
          <S.PanelTitle>Editar avaliação</S.PanelTitle>

          <TextField label="Nome da avaliação" value={nome} onChange={(e) => setNome(e.target.value)} fullWidth />

          <S.FormRow>
            <FormControl fullWidth>
              <InputLabel>Disciplina</InputLabel>
              <Select value={disciplinaId} label="Disciplina" onChange={(e) => setDisciplinaId(e.target.value)}>
                {minhasTurmas.map((d) => (
                  <MenuItem key={d.disciplinaId} value={String(d.disciplinaId)}>
                    {d.nomeDisciplina}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select value={tipo} label="Tipo" onChange={(e) => setTipo(e.target.value as TipoAvaliacao)}>
                {TIPOS.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </S.FormRow>

          <S.FormRow>
            <TextField label="Nota máxima" value={notaMaxima} onChange={(e) => setNotaMaxima(e.target.value)} />
            <FormControlLabel
              control={<Checkbox checked={notaExtra} onChange={(e) => setNotaExtra(e.target.checked)} />}
              label="Nota extra"
            />
          </S.FormRow>

          <TextField
            label="Conteúdo / descrição"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            multiline
            rows={5}
            fullWidth
          />

          {avaliacao.anexos.length > 0 && (
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Anexos
              </Typography>
              {avaliacao.anexos.map((anexo) => (
                <Link
                  key={anexo.id}
                  href={anexo.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ display: "block" }}
                >
                  {anexo.nome}
                </Link>
              ))}
            </Box>
          )}

          <S.EditActions>
            {salvo && (
              <S.SavedIndicator>
                <CheckRounded />
                Alterações salvas
              </S.SavedIndicator>
            )}
            <Button
              variant="contained"
              onClick={handleSalvarConteudo}
              disabled={!dirty || updateAvaliacao.isPending}
            >
              {updateAvaliacao.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </S.EditActions>
        </S.EditPanel>

        <S.Panel>
          <S.PanelTitle>Turmas que farão esta avaliação</S.PanelTitle>

          {loadingTurmas ? (
            <CircularProgress size={24} />
          ) : (
            <S.TurmasList>
              {turmas.map((t) => {
                const completo = t.totalAlunos > 0 && t.alunosCorrigidos >= t.totalAlunos;
                const emAndamento = t.alunosCorrigidos > 0 && !completo;
                return (
                  <div key={t.id}>
                    <S.TurmaRow
                      onClick={() =>
                        router.push(
                          `${RoutesEnum.AVALIACAO_TURMA_NOTAS}?avaliacaoTurmaId=${t.id}&avaliacaoId=${avaliacaoId}`,
                        )
                      }
                    >
                      <S.TurmaMain>
                        <S.TurmaName>
                          {avaliacao.disciplina} — {t.turma}
                        </S.TurmaName>
                        <S.TurmaSub>
                          {t.totalAlunos} alunos · {t.alunosCorrigidos}/{t.totalAlunos} notas lançadas
                        </S.TurmaSub>
                      </S.TurmaMain>
                      <S.TurmaRight>
                        {completo ? (
                          <Badge $tone="success">
                            <CheckRounded sx={{ fontSize: 14 }} />
                            Concluído
                          </Badge>
                        ) : emAndamento ? (
                          <Badge $tone="warning">
                            <MoreHorizRounded sx={{ fontSize: 14 }} />
                            Em andamento
                          </Badge>
                        ) : (
                          <Badge $tone="neutral">
                            <EditNoteRounded sx={{ fontSize: 14 }} />
                            Lançar notas
                          </Badge>
                        )}
                        <IconButton
                          size="small"
                          aria-label="Editar datas"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTurmaEditandoDatas((atual) => (atual === t.id ? null : t.id));
                          }}
                        >
                          <EditCalendarRounded fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="Remover turma"
                          onClick={(e) => {
                            e.stopPropagation();
                            removerTurma.mutate(t.id);
                          }}
                          disabled={removerTurma.isPending}
                        >
                          <DeleteOutlineRounded fontSize="small" sx={{ color: cssVarColor("error") }} />
                        </IconButton>
                        <ChevronRightRounded sx={{ color: cssVarColor("textTertiary") }} />
                      </S.TurmaRight>
                    </S.TurmaRow>

                    {turmaEditandoDatas === t.id && (
                      <S.TurmaDatesEditor>
                        <TextField
                          label="Aplicação"
                          type="date"
                          size="small"
                          value={datasEdicao[t.id]?.dataAplicacao ?? ""}
                          onChange={(e) =>
                            setDatasEdicao((atual) => ({
                              ...atual,
                              [t.id]: { ...atual[t.id], dataAplicacao: e.target.value },
                            }))
                          }
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                        />
                        <TextField
                          label="Entrega de notas"
                          type="date"
                          size="small"
                          value={datasEdicao[t.id]?.dataEntregaNotas ?? ""}
                          onChange={(e) =>
                            setDatasEdicao((atual) => ({
                              ...atual,
                              [t.id]: { ...atual[t.id], dataEntregaNotas: e.target.value },
                            }))
                          }
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                        />
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleSalvarDatasTurma(t.id)}
                          disabled={atualizarDatasTurma.isPending}
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          Salvar
                        </Button>
                      </S.TurmaDatesEditor>
                    )}
                  </div>
                );
              })}
              {turmas.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
                  Nenhuma turma vinculada a esta avaliação.
                </Typography>
              )}
            </S.TurmasList>
          )}

          {turmasDisponiveisParaAdicionar.length > 0 && (
            <S.AddTurmaRow>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Adicionar turma</InputLabel>
                <Select
                  value={novaTurmaId}
                  label="Adicionar turma"
                  onChange={(e) => setNovaTurmaId(e.target.value)}
                >
                  {turmasDisponiveisParaAdicionar.map((t) => (
                    <MenuItem key={t.turmaId} value={String(t.turmaId)}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                onClick={handleAdicionarTurma}
                disabled={!novaTurmaId || adicionarTurma.isPending}
              >
                Adicionar
              </Button>
            </S.AddTurmaRow>
          )}
        </S.Panel>
      </S.DetailGrid>
    </Box>
  );
}

export default function AvaliacaoDetalhePage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <AvaliacaoDetalheContent />
    </Suspense>
  );
}
