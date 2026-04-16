"use client";
import BrainButtonPrimary from "@/components/brainButtons/brainButtonPrimary/brainButtonPrimary";
import BrainButtonSecondary from "@/components/brainButtons/brainButtonSecondary/brainButtonSecondary";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useTurma } from "@/hooks/useTurma";
import { useHorarios } from "@/hooks/useHorarios";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useProfessores } from "@/hooks/useProfessores";
import { useGradeCurricular } from "@/hooks/useGradeCurricular";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useBrainSearchParams } from "@/hooks/useBrainSearchParams";
import { Suspense, useCallback, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { turmaApi } from "@/services/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "react-toastify";
import { TurmaHorarioItemRequest } from "@/services/domains/turma/request";
import * as S from "./styles";

const DIAS_SEMANA = [
  { key: "segunda", label: "Segunda" },
  { key: "terca", label: "Terça" },
  { key: "quarta", label: "Quarta" },
  { key: "quinta", label: "Quinta" },
  { key: "sexta", label: "Sexta" },
];

interface CellAssignment {
  disciplinaId: number;
  disciplinaNome: string;
  professorId: number;
  professorNome: string;
}

function DefinirHorariosPageContent() {
  const router = useRouter();
  const turmaId = useBrainSearchParams("turmaId");

  const { turma, loading: loadingTurma, error: errorTurma } = useTurma(turmaId);
  const { horarios, loading: loadingHorarios } = useHorarios();
  const { disciplinas } = useDisciplinas();
  const { professores } = useProfessores();
  const { gradeCurricular } = useGradeCurricular(
    turma?.gradeCurricularId ? String(turma.gradeCurricularId) : null,
  );

  // Map: "diaSemana-horarioId" -> CellAssignment
  const [assignments, setAssignments] = useState<Record<string, CellAssignment>>({});

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ dia: string; horarioId: number } | null>(null);
  const [dialogDisciplinaId, setDialogDisciplinaId] = useState<number | "">("");
  const [dialogProfessorId, setDialogProfessorId] = useState<number | "">("");

  const queryClient = useQueryClient();

  const salvarMutation = useMutation({
    mutationFn: () => {
      const horarioItems: TurmaHorarioItemRequest[] = Object.entries(assignments).map(
        ([key, value]) => {
          const [diaSemana, horarioIdStr] = key.split("-");
          return {
            diaSemana,
            horarioId: Number(horarioIdStr),
            disciplinaId: value.disciplinaId,
            professorId: value.professorId,
          };
        },
      );
      return turmaApi.definirHorarios({
        turmaId: turmaId!,
        horarios: horarioItems,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.turmas.all });
      toast.success("Horários definidos com sucesso!");
      router.push("/turma/lista");
    },
    onError: (error) => {
      console.error("Erro ao definir horários:", error);
      toast.error("Erro ao definir horários. Tente novamente.");
    },
  });

  const gradeDisciplinas = useMemo(() => {
    if (gradeCurricular) {
      return gradeCurricular.disciplinas;
    }
    return disciplinas.map((d) => ({
      id: d.id,
      nome: d.nome,
      cargaHorariaSemanal: Number(d.cargaHoraria),
      obrigatoria: true,
    }));
  }, [gradeCurricular, disciplinas]);

  const handleCellClick = useCallback(
    (dia: string, horarioId: number) => {
      const key = `${dia}-${horarioId}`;
      const existing = assignments[key];
      setEditingCell({ dia, horarioId });
      setDialogDisciplinaId(existing?.disciplinaId || "");
      setDialogProfessorId(existing?.professorId || "");
      setDialogOpen(true);
    },
    [assignments],
  );

  function handleDialogSave() {
    if (!editingCell || !dialogDisciplinaId || !dialogProfessorId) return;
    const key = `${editingCell.dia}-${editingCell.horarioId}`;
    const disc = gradeDisciplinas.find((d) => d.id === dialogDisciplinaId);
    const prof = professores.find((p) => p.id === dialogProfessorId);
    setAssignments((prev) => ({
      ...prev,
      [key]: {
        disciplinaId: dialogDisciplinaId as number,
        disciplinaNome: disc?.nome || "",
        professorId: dialogProfessorId as number,
        professorNome: prof?.nome || "",
      },
    }));
    setDialogOpen(false);
    setEditingCell(null);
  }

  function handleDialogClear() {
    if (!editingCell) return;
    const key = `${editingCell.dia}-${editingCell.horarioId}`;
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setDialogOpen(false);
    setEditingCell(null);
  }

  function handleCancel() {
    router.push("/turma/lista");
  }

  const totalAssigned = Object.keys(assignments).length;

  // Count per disciplina
  const disciplinaCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    Object.values(assignments).forEach((a) => {
      counts[a.disciplinaId] = (counts[a.disciplinaId] || 0) + 1;
    });
    return counts;
  }, [assignments]);

  if (!turmaId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Nenhuma turma selecionada. Volte para a lista de turmas e selecione uma turma.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {loadingTurma || loadingHorarios ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : errorTurma ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorTurma}
        </Alert>
      ) : (
        <>
          <PageTitle
            title={`Definir Horários — ${turma?.nome || ""}`}
            description="Clique nas células para atribuir disciplinas e professores aos horários."
          />

          <S.PageLayout>
            {/* Grade de Horários */}
            <S.HorarioGrid>
              <S.GridTable>
                <thead>
                  <tr>
                    <th>Horário</th>
                    {DIAS_SEMANA.map((dia) => (
                      <th key={dia.key}>{dia.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {horarios.map((horario) => (
                    <tr key={horario.id}>
                      <td>
                        <S.HorarioLabel>
                          <div className="horario-nome">{horario.nome}</div>
                          <div className="horario-periodo">
                            {horario.horarioInicio} - {horario.horarioFim}
                          </div>
                        </S.HorarioLabel>
                      </td>
                      {DIAS_SEMANA.map((dia) => {
                        const key = `${dia.key}-${horario.id}`;
                        const assignment = assignments[key];
                        return (
                          <td key={dia.key}>
                            <S.CellContent
                              $filled={!!assignment}
                              onClick={() => handleCellClick(dia.key, horario.id)}
                            >
                              {assignment ? (
                                <>
                                  <span className="cell-disciplina">
                                    {assignment.disciplinaNome}
                                  </span>
                                  <span className="cell-professor">
                                    {assignment.professorNome}
                                  </span>
                                </>
                              ) : (
                                <span className="cell-empty">+</span>
                              )}
                            </S.CellContent>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </S.GridTable>
            </S.HorarioGrid>

            {/* Sidebar */}
            <S.SidebarCard>
              <S.SidebarHeader>
                <h4>Resumo</h4>
              </S.SidebarHeader>
              <S.ResumoItem>
                <span className="resumo-label">Turma</span>
                <span className="resumo-value">{turma?.nome || "—"}</span>
              </S.ResumoItem>
              <S.ResumoItem>
                <span className="resumo-label">Aulas Definidas</span>
                <span className="resumo-value">{totalAssigned}</span>
              </S.ResumoItem>

              {gradeDisciplinas.length > 0 && (
                <>
                  <S.SidebarHeader>
                    <h4>Distribuição</h4>
                  </S.SidebarHeader>
                  {gradeDisciplinas.map((disc) => (
                    <S.ResumoItem key={disc.id}>
                      <span className="resumo-label">{disc.nome}</span>
                      <span className="resumo-value">
                        {disciplinaCounts[disc.id] || 0} / {disc.cargaHorariaSemanal}h
                      </span>
                    </S.ResumoItem>
                  ))}
                </>
              )}
            </S.SidebarCard>
          </S.PageLayout>

          {/* Botões */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mt: 4,
            }}
          >
            <BrainButtonSecondary onClick={handleCancel}>Cancelar</BrainButtonSecondary>
            <BrainButtonPrimary
              onClick={() => salvarMutation.mutate()}
              disabled={totalAssigned === 0 || salvarMutation.isPending}
            >
              {salvarMutation.isPending ? "Salvando..." : "Salvar Horários"}
            </BrainButtonPrimary>
          </Box>

          {/* Dialog para atribuir disciplina/professor */}
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>
              Atribuir Aula —{" "}
              {editingCell
                ? `${DIAS_SEMANA.find((d) => d.key === editingCell.dia)?.label}, ${horarios.find((h) => h.id === editingCell.horarioId)?.nome}`
                : ""}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                <TextField
                  select
                  label="Disciplina"
                  value={dialogDisciplinaId}
                  onChange={(e) => setDialogDisciplinaId(Number(e.target.value))}
                  fullWidth
                  size="small"
                >
                  {gradeDisciplinas.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.nome}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Professor"
                  value={dialogProfessorId}
                  onChange={(e) => setDialogProfessorId(Number(e.target.value))}
                  fullWidth
                  size="small"
                >
                  {professores.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.nome}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClear} color="error">
                Limpar
              </Button>
              <Button onClick={() => setDialogOpen(false)} color="inherit">
                Cancelar
              </Button>
              <Button
                onClick={handleDialogSave}
                variant="contained"
                disabled={!dialogDisciplinaId || !dialogProfessorId}
              >
                Salvar
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
}

export default function DefinirHorariosPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        </Container>
      }
    >
      <DefinirHorariosPageContent />
    </Suspense>
  );
}
