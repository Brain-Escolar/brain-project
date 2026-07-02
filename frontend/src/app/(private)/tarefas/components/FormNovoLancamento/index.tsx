"use client";

import FileUploadArea from "@/components/fileUploadArea";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { professorApi } from "@/services/api";
import { ProfessorAulaSemanalResponse } from "@/services/domains/professor";
import { TarefaLotePostRequest } from "@/services/domains/tarefa/request";
import { useTarefaMutations } from "../../../tarefa/useTarefaMutations";
import EventAvailableRounded from "@mui/icons-material/EventAvailableRounded";
import {
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import * as S from "./styles";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const DIA_ORDEM: Record<string, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

function gerarSemanas(quantidade = 8): Array<{ label: string; value: string }> {
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const offsetSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
  const segundaAtual = new Date(hoje);
  segundaAtual.setDate(hoje.getDate() + offsetSegunda);

  return Array.from({ length: quantidade }, (_, i) => {
    const segunda = new Date(segundaAtual);
    segunda.setDate(segundaAtual.getDate() + i * 7);
    const domingo = new Date(segunda);
    domingo.setDate(segunda.getDate() + 6);

    const isoSegunda = segunda.toISOString().split("T")[0];
    const labelInicio = `${String(segunda.getDate()).padStart(2, "0")} ${MESES[segunda.getMonth()]}`;
    const labelFim = `${String(domingo.getDate()).padStart(2, "0")} ${MESES[domingo.getMonth()]}`;

    return { label: `${labelInicio} - ${labelFim}`, value: isoSegunda };
  });
}

const SEMANAS = gerarSemanas();

interface TurmaGrupo {
  turmaId: number;
  label: string;
  aulasOrdenadas: ProfessorAulaSemanalResponse[];
}

function prazoPreview(turma: TurmaGrupo, numeroAula: number): { label: string; when: string } | null {
  const total = turma.aulasOrdenadas.length;
  if (!numeroAula || numeroAula > total) return null;
  if (numeroAula < total) {
    return { label: `${numeroAula + 1}ª aula`, when: "nesta semana" };
  }
  return { label: "1ª aula", when: "na próxima semana" };
}

export default function FormNovoLancamento() {
  const { createTarefaLote } = useTarefaMutations();

  const [semanaInicio, setSemanaInicio] = useState("");
  const [serieId, setSerieId] = useState("");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [numeroAula, setNumeroAula] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [addTarefa, setAddTarefa] = useState(false);
  const [tarefa, setTarefa] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());

  const { data: aulasSemanais = [] } = useQuery({
    queryKey: [...QUERY_KEYS.aulas.all, "semana"],
    queryFn: () => professorApi.getAulasSemanalProfessor(),
    staleTime: 10 * 60 * 1000,
  });

  const series = useMemo<Array<{ id: number; nome: string }>>(() => {
    const map = new Map<number, string>();
    aulasSemanais.forEach((a) => map.set(a.serieId, a.serie));
    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
  }, [aulasSemanais]);

  const disciplinas = useMemo<Array<{ id: number; nome: string }>>(() => {
    if (!serieId) return [];
    const map = new Map<number, string>();
    aulasSemanais
      .filter((a) => a.serieId === Number(serieId))
      .forEach((a) => map.set(a.disciplinaId, a.disciplina));
    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
  }, [aulasSemanais, serieId]);

  const turmas = useMemo<TurmaGrupo[]>(() => {
    if (!serieId || !disciplinaId) return [];
    const filtradas = aulasSemanais.filter(
      (a) => a.serieId === Number(serieId) && a.disciplinaId === Number(disciplinaId),
    );
    const porTurma = new Map<number, ProfessorAulaSemanalResponse[]>();
    filtradas.forEach((a) => {
      const lista = porTurma.get(a.turmaId) ?? [];
      lista.push(a);
      porTurma.set(a.turmaId, lista);
    });
    return Array.from(porTurma.entries()).map(([turmaId, aulas]) => ({
      turmaId,
      label: `${aulas[0].serie} ${aulas[0].turma}`,
      aulasOrdenadas: [...aulas].sort((a, b) => {
        const dia = DIA_ORDEM[a.diaDaSemana] - DIA_ORDEM[b.diaDaSemana];
        return dia !== 0 ? dia : a.horarioInicio.localeCompare(b.horarioInicio);
      }),
    }));
  }, [aulasSemanais, serieId, disciplinaId]);

  const maxAulas = useMemo(
    () => Math.max(0, ...turmas.map((t) => t.aulasOrdenadas.length)),
    [turmas],
  );

  function handleSerieChange(value: string) {
    setSerieId(value);
    setDisciplinaId("");
    setNumeroAula("");
    setSelecionadas(new Set());
  }

  function handleDisciplinaChange(value: string) {
    setDisciplinaId(value);
    setNumeroAula("");
    const filtradas = aulasSemanais.filter(
      (a) => a.serieId === Number(serieId) && a.disciplinaId === Number(value),
    );
    setSelecionadas(new Set(filtradas.map((a) => a.turmaId)));
  }

  function toggleTurma(turmaId: number) {
    setSelecionadas((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(turmaId)) {
        proximo.delete(turmaId);
      } else {
        proximo.add(turmaId);
      }
      return proximo;
    });
  }

  function toggleTodas() {
    setSelecionadas(selecionadas.size === turmas.length ? new Set() : new Set(turmas.map((t) => t.turmaId)));
  }

  const turmasAtivas = turmas.filter((t) => selecionadas.has(t.turmaId));

  const valido =
    !!semanaInicio &&
    !!serieId &&
    !!disciplinaId &&
    !!numeroAula &&
    conteudo.trim().length > 0 &&
    turmasAtivas.length > 0 &&
    (!addTarefa || tarefa.trim().length > 0);

  function limpar() {
    setSemanaInicio("");
    setSerieId("");
    setDisciplinaId("");
    setNumeroAula("");
    setConteudo("");
    setAddTarefa(false);
    setTarefa("");
    setSelectedFile(null);
    setSelecionadas(new Set());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valido) {
      toast.error("Preencha os campos obrigatórios e selecione ao menos uma turma.");
      return;
    }

    const dados: TarefaLotePostRequest = {
      semanaInicio,
      numeroAula: Number(numeroAula),
      serieId: Number(serieId),
      disciplinaId: Number(disciplinaId),
      conteudo,
      addTarefa,
      tarefa: addTarefa ? tarefa : undefined,
      turmaIds: Array.from(selecionadas),
    };

    const resultado = await createTarefaLote.mutateAsync({ dados, arquivo: selectedFile ?? undefined });
    toast.success(
      `Diário lançado em ${resultado.turmasRegistradas} turma${resultado.turmasRegistradas === 1 ? "" : "s"}${
        addTarefa ? ` · ${resultado.tarefasCriadas} tarefa(s) com prazo definido` : ""
      }.`,
    );
    limpar();
  }

  return (
    <form onSubmit={handleSubmit}>
      <S.Grid>
        <S.MainPanel>
          <S.SelectRow>
            <FormControl required fullWidth>
              <InputLabel>Série</InputLabel>
              <Select value={serieId} label="Série" onChange={(e) => handleSerieChange(e.target.value)}>
                {series.map((s) => (
                  <MenuItem key={s.id} value={String(s.id)}>
                    {s.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl required fullWidth disabled={!serieId}>
              <InputLabel>Disciplina</InputLabel>
              <Select
                value={disciplinaId}
                label="Disciplina"
                onChange={(e) => handleDisciplinaChange(e.target.value)}
              >
                {disciplinas.map((d) => (
                  <MenuItem key={d.id} value={String(d.id)}>
                    {d.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl required fullWidth>
              <InputLabel>Semana</InputLabel>
              <Select
                value={semanaInicio}
                label="Semana"
                onChange={(e) => setSemanaInicio(e.target.value)}
              >
                {SEMANAS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl required fullWidth disabled={!disciplinaId || maxAulas === 0}>
              <InputLabel>Aula da semana</InputLabel>
              <Select
                value={numeroAula}
                label="Aula da semana"
                onChange={(e) => setNumeroAula(e.target.value)}
              >
                {Array.from({ length: maxAulas }, (_, i) => (
                  <MenuItem key={i + 1} value={String(i + 1)}>
                    {i + 1}ª aula
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </S.SelectRow>

          <TextField
            label="Conteúdo da aula"
            placeholder="O que foi trabalhado nesta aula? Ex.: Equações do 1º grau — resolução e problemas."
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            helperText="Aplicado a todas as turmas selecionadas."
            multiline
            rows={4}
            required
            fullWidth
          />

          <S.ToggleRow>
            <S.ToggleText>
              <b>Tarefa de casa</b>
              <span>Opcional — recebe prazo automático na aula seguinte à selecionada</span>
            </S.ToggleText>
            <Switch
              checked={addTarefa}
              onChange={(e) => setAddTarefa(e.target.checked)}
              inputProps={{ "aria-label": "Adicionar tarefa de casa" }}
            />
          </S.ToggleRow>

          {addTarefa && (
            <>
              <TextField
                label="Tarefa de casa"
                placeholder="Ex.: Lista 5 — exercícios 1 a 10. Trazer resolvido na próxima aula."
                value={tarefa}
                onChange={(e) => setTarefa(e.target.value)}
                multiline
                rows={3}
                fullWidth
              />
              <div>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Anexo (opcional)
                </Typography>
                <FileUploadArea
                  files={selectedFile ? [selectedFile] : []}
                  onChange={(files) => setSelectedFile(files[files.length - 1] ?? null)}
                  multiple={false}
                  label="Clique para selecionar um arquivo (PDF, Word, Excel, PowerPoint ou imagem)"
                />
              </div>
            </>
          )}

          {numeroAula && turmasAtivas.length > 0 && (
            <S.PrazoBanner>
              <EventAvailableRounded />
              <span>
                {addTarefa
                  ? "Ao lançar, a tarefa de cada turma receberá prazo para a aula seguinte à selecionada (ou a 1ª aula da próxima semana, se for a última da semana). Veja o prazo de cada turma na lista ao lado."
                  : "Nenhuma tarefa de casa será registrada — apenas o conteúdo da aula será lançado."}
              </span>
            </S.PrazoBanner>
          )}

          <S.Actions>
            <Button
              variant="contained"
              type="submit"
              disabled={!valido || createTarefaLote.isPending}
              startIcon={createTarefaLote.isPending ? <CircularProgress size={16} /> : undefined}
            >
              {createTarefaLote.isPending
                ? "Lançando..."
                : `Lançar em ${turmasAtivas.length || 0} turma${turmasAtivas.length === 1 ? "" : "s"}`}
            </Button>
          </S.Actions>
        </S.MainPanel>

        <S.SidePanel>
          <S.SideHead>
            <div>
              <h3>Turmas</h3>
              <p>
                {selecionadas.size} de {turmas.length} selecionada{turmas.length === 1 ? "" : "s"}
              </p>
            </div>
            {turmas.length > 0 && (
              <S.SelectAllButton type="button" onClick={toggleTodas}>
                {selecionadas.size === turmas.length ? "Limpar" : "Selecionar todas"}
              </S.SelectAllButton>
            )}
          </S.SideHead>

          {turmas.length === 0 ? (
            <S.EmptyTurmas>
              {disciplinaId ? "Nenhuma turma encontrada." : "Selecione série e disciplina para ver as turmas."}
            </S.EmptyTurmas>
          ) : (
            <S.TurmaList>
              {turmas.map((t) => {
                const selecionada = selecionadas.has(t.turmaId);
                const semAulaSuficiente = !!numeroAula && Number(numeroAula) > t.aulasOrdenadas.length;
                const prazo = numeroAula ? prazoPreview(t, Number(numeroAula)) : null;

                return (
                  <S.TurmaRow key={t.turmaId} $selected={selecionada}>
                    <S.TurmaRowHead>
                      <Checkbox
                        checked={selecionada}
                        onChange={() => toggleTurma(t.turmaId)}
                        size="small"
                        disabled={semAulaSuficiente}
                      />
                      <S.TurmaName>
                        <b>{t.label}</b>
                        {semAulaSuficiente ? (
                          <span>Não possui essa aula nesta semana</span>
                        ) : prazo ? (
                          <span>
                            Prazo: {prazo.label} ({prazo.when})
                          </span>
                        ) : (
                          <span>{t.aulasOrdenadas.length} aula(s) na semana</span>
                        )}
                      </S.TurmaName>
                    </S.TurmaRowHead>
                  </S.TurmaRow>
                );
              })}
            </S.TurmaList>
          )}
        </S.SidePanel>
      </S.Grid>
    </form>
  );
}
